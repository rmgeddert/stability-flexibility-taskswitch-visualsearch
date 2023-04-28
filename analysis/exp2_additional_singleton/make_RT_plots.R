library(tidyverse)
library(plotrix)
library(cowplot)
library(patchwork)

setwd("path/to/stability-flexibility-taskswitch-visualsearch")

#' function to do analyze
prepareDataSets <- function(df){
  # get means by subject
  RT_means <- df %>% 
    group_by(subject, distractorType, taskSequence, switchProp, distractorProp) %>% 
    summarise(mean_RT = mean(RT, na.rm = TRUE))
  
  RT_sub_means <- df %>% 
    group_by(subject) %>% 
    summarise(mean_RT = mean(RT, na.rm = TRUE))
  
  return(list(RT_means = RT_means, sub_means = RT_sub_means))
}

all <- read_csv('data/exp2_additional_singleton/RT_all.csv') %>% 
  mutate(across(c(distractorType, taskSequence, subject, switchProp, distractorProp), as.factor))

all_dfs <- prepareDataSets(all)

all_df <- all_dfs[[1]]

all_stats <- all_df %>% 
  group_by(distractorType, taskSequence, switchProp, distractorProp) %>% 
  summarise(sem_RT = std.error(mean_RT), mean_RT = mean(mean_RT))

switch_costs <- all_df %>% 
  group_by(subject, switchProp, distractorProp, taskSequence) %>% 
  summarise(mean_RT = mean(mean_RT)) %>% 
  mutate(sum_RT = sum(mean_RT)) %>% 
  filter(taskSequence == 's') %>% 
  mutate(diff_RT = mean_RT - (sum_RT - mean_RT)) %>% 
  ungroup() %>% 
  select(subject, switchProp, distractorProp, diff_RT)
  
distractor_costs <- all_df %>% 
  group_by(subject, switchProp, distractorProp, distractorType) %>% 
  summarise(mean_RT = mean(mean_RT)) %>% 
  mutate(sum_RT = sum(mean_RT)) %>% 
  filter(distractorType == 'd') %>% 
  mutate(diff_RT = mean_RT - (sum_RT - mean_RT)) %>% 
  ungroup() %>% 
  select(subject, switchProp, distractorProp, diff_RT)

costs <- distractor_costs %>% 
  group_by(switchProp, distractorProp) %>% 
  summarise(ce_mean = mean(diff_RT), ce_sem = std.error(diff_RT)) %>% 
  left_join(switch_costs %>% 
          group_by(switchProp, distractorProp) %>% 
          summarise(sc_mean = mean(diff_RT), sc_sem = std.error(diff_RT)),
          by = c('switchProp' = 'switchProp', 'distractorProp' = 'distractorProp'))

all_stats <- all_stats %>% 
  left_join(costs)

# levels(all_stats$switchProp) <- c('25% Switch', '75% Switch')
# levels(all_stats$distractorProp) <- c('25% Incongruent', '75% Incongruent')
# ggplot(all_stats, aes(x=taskSequence, y=mean_RT, color=distractorType, group=distractorType)) +
#   geom_errorbar(aes(ymin=mean_RT - sem_RT, ymax=mean_RT + sem_RT), width=.1) +
#   geom_line() +
#   geom_point(size=3) +
#   facet_grid(switchProp ~ distractorProp) +
#   xlab('Task Sequence') +
#   ylab('Reaction Time (ms)') +
#   guides(color=guide_legend(title="Distractor Type")) +
#   scale_color_manual(values = c('#6B717E', '#5D85FF'), labels=c('Congruent', 'Incongruent')) +
#   scale_x_discrete(labels=c('Repeat', 'Switch')) +
#   scale_y_continuous(limits = c(850, 1100)) +
#   theme(panel.grid = element_blank(),
#         strip.background = element_blank(),
#         strip.text = element_text(size = 15))


# lines thicker
# remove greyish "thing"
# change y axis to be consistent DONE
# make the colors not default
# remove grid lines from background
# remove the boxes for the facet labels

make_plot <- function(data){
  leftPlot <- data$switchProp[[1]] == '25%'
  topPlot <- data$distractorProp[[1]] == '25%'
  
  main <- ggplot(data, aes(x=taskSequence, y=mean_RT, color=distractorType, group=distractorType)) +
    geom_errorbar(aes(ymin=mean_RT - sem_RT, ymax=mean_RT + sem_RT), width=.1) +
    geom_line() +
    geom_point(size=3) +
    ylab(ifelse(leftPlot, "Reaction Time (ms)", 
                ifelse(topPlot, '25% Distractors\n', '75% Distractors\n'))) +
    scale_y_continuous(position=ifelse(leftPlot, 'left','right')) +
    scale_x_discrete(labels=c('Repeat', 'Switch')) +
    scale_color_manual(values = c('#6B717E', '#5D85FF'), labels=c('Present', 'Absent')) +
    theme(axis.title.x = element_blank(),
          #axis.title.y = ifelse(!leftPlot, element_blank, element_text)(),
          #axis.text.x = element_blank(),
          axis.text.y = ifelse(!leftPlot, element_blank, element_text)(),
          axis.ticks.x = element_blank(),
          axis.ticks.y = ifelse(!leftPlot, element_blank, element_line)(),
          legend.position = "none",
          panel.grid = element_blank(),
          plot.title = element_text(hjust = 0.5))
  
  sub_df <- tibble(condition = c('Switch \nCost', 'Distractor \n Type'), 
                   vals = c(data$sc_mean[1], data$ce_mean[1]),
                   sems = c(data$sc_sem[1], data$ce_sem[1]))
  sub <- ggplot(sub_df, aes(x=condition, y=vals)) +
    geom_bar(stat="identity", fill = 'grey70', color='grey70') +
    geom_errorbar(aes(ymin=vals - sems, ymax=vals + sems), width=.1) +
    scale_y_continuous(limits=c(0, 200), breaks=c(0, 100, 200)) + 
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
        guides(color=guide_legend(title="Distractor Type"))
    }
  } 
  
  if (!leftPlot){
    main <- main + theme(axis.title.y = element_text(size=14))
  }
  
  return(main + sub + plot_layout(nrow = 2, heights = c(3,1)))
}

p <- split(all_stats, list(all_stats$switchProp, all_stats$distractorProp)) %>% 
  lapply(make_plot)

p %>% 
  wrap_plots() %>% 
  plot_layout(guides = "collect") 
