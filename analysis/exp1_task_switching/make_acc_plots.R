library(tidyverse)
library(plotrix)
library(cowplot)

setwd("path/to/stability-flexibility-taskswitch-visualsearch/")

#' function to do analyze
prepareDataSets <- function(df){
  # get means by subject
  acc_means <- df %>% 
    group_by(subject, congruency, taskSequence, switchProp, incongruentProp) %>% 
    summarise(mean_acc = mean(acc, na.rm = TRUE))
  
  acc_sub_means <- df %>% 
    group_by(subject) %>% 
    summarise(mean_acc = mean(acc, na.rm = TRUE))
  
  return(list(acc_means = acc_means, acc_sub_means = acc_sub_means))
}

all <- read_csv('data/exp1_task_switching/acc_all.csv') %>% 
  mutate(across(c(congruency, taskSequence, subject, switchProp, incongruentProp), as.factor))

all_dfs <- prepareDataSets(all)

all_df <- all_dfs[[1]]

all_stats <- all_df %>% 
  group_by(congruency, taskSequence, switchProp, incongruentProp) %>% 
  summarise(sem_acc = std.error(mean_acc), mean_acc = mean(mean_acc))

switch_costs <- all_df %>% 
  group_by(subject, switchProp, incongruentProp, taskSequence) %>% 
  summarise(mean_acc = mean(mean_acc)) %>% 
  mutate(sum_acc = sum(mean_acc)) %>% 
  filter(taskSequence == 'r') %>% 
  mutate(diff_acc = mean_acc - (sum_acc - mean_acc)) %>% 
  ungroup() %>% 
  select(subject, switchProp, incongruentProp, diff_acc)

congruency_costs <- all_df %>% 
  group_by(subject, switchProp, incongruentProp, congruency) %>% 
  summarise(mean_acc = mean(mean_acc)) %>% 
  mutate(sum_acc = sum(mean_acc)) %>% 
  filter(congruency == 'c') %>% 
  mutate(diff_acc = mean_acc - (sum_acc - mean_acc)) %>% 
  ungroup() %>% 
  select(subject, switchProp, incongruentProp, diff_acc)

costs <- congruency_costs %>% 
  group_by(switchProp, incongruentProp) %>% 
  summarise(ce_mean = mean(diff_acc), ce_sem = std.error(diff_acc)) %>% 
  left_join(switch_costs %>% 
              group_by(switchProp, incongruentProp) %>% 
              summarise(sc_mean = mean(diff_acc), sc_sem = std.error(diff_acc)),
            by = c('switchProp' = 'switchProp', 'incongruentProp' = 'incongruentProp'))

all_stats <- all_stats %>% 
  left_join(costs)

make_plot <- function(data){
  leftPlot <- data$switchProp[[1]] == '25%'
  topPlot <- data$incongruentProp[[1]] == '25%'
  
  main <- ggplot(data, aes(x=taskSequence, y=mean_acc, color=congruency, group=congruency)) +
    geom_errorbar(aes(ymin=mean_acc - sem_acc, ymax=mean_acc + sem_acc), width=.1) +
    geom_line() +
    geom_point(size=3) +
    ylab(ifelse(leftPlot, "Accuracy (%)", 
                ifelse(topPlot, '25% Incongruent\n', '75% Incongruent\n'))) +
    scale_y_continuous(limits = c(0.68, 1), position=ifelse(leftPlot, 'left','right')) +
    scale_x_discrete(labels=c('Repeat', 'Switch')) +
    scale_color_manual(values = c('#6B717E', '#5D85FF'), labels=c('Congruent', 'Incongruent')) +
    theme(axis.title.x = element_blank(),
          #axis.title.y = ifelse(!leftPlot, element_blank, element_text)(),
          #axis.text.x = element_blank(),
          axis.text.y = ifelse(!leftPlot, element_blank, element_text)(),
          axis.ticks.x = element_blank(),
          axis.ticks.y = ifelse(!leftPlot, element_blank, element_line)(),
          legend.position = "none",
          panel.grid = element_blank(),
          plot.title = element_text(hjust = 0.5))
  
  sub_df <- tibble(condition = c('Switch \nCost', 'Congruency \nEffect'), 
                   vals = c(data$sc_mean[1], data$ce_mean[1]),
                   sems = c(data$sc_sem[1], data$ce_sem[1]))
  sub <- ggplot(sub_df, aes(x=condition, y=vals)) +
    geom_bar(stat="identity", fill = 'grey70', color='grey70') +
    geom_errorbar(aes(ymin=vals - sems, ymax=vals + sems), width=.1) +
    scale_y_continuous(limits=c(0, 0.30)) +
    theme(axis.title.y = element_blank(),
          #axis.title.y = ifelse(!leftPlot, element_blank, element_text)(),
          axis.text.y = ifelse(!leftPlot, element_blank, element_text)(),
          axis.ticks.y = ifelse(!leftPlot, element_blank, element_line)(),
          axis.title.x = element_blank(),
          axis.ticks.x = element_blank(),
          panel.grid = element_blank())
  
  # add titles to top
  if (topPlot){
    if (leftPlot){
      main <- main + ggtitle('25% Switch')
    } else {
      main <- main + ggtitle('75% Switch') + 
        theme(legend.position = 'right') +
        guides(color=guide_legend(title="Congruency"))
    }
  } 
  
  if (!leftPlot){
    main <- main + theme(axis.title.y = element_text(size=14))
  }
  
  return(main + sub + plot_layout(nrow = 2, heights = c(3,1)))
}

p <- split(all_stats, list(all_stats$switchProp, all_stats$incongruentProp)) %>% 
  lapply(make_plot)

p %>% 
  wrap_plots() %>% 
  plot_layout(guides = "collect") 

ggsave()
