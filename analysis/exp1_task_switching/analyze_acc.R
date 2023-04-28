library(tidyverse)
library(reshape2) #for the dcast function to get output ready for jasp
library(xtable) #for outputting into latex
library(psychReport) #for getting effect sizes and pretty tables of aov results
library(emmeans) #for getting marginal means
library(psych) #for mauchly.test
options(scipen=999)
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

#' function to create latex code for table
getTableLatex <- function(aovObj){
  #using psychReport instead to get partial eta squared and fix p values
  aov_res <- aovEffectSize(aovObj)$ANOVA
  aov_res$p = ifelse(round(aov_res$p, 3) == 0, 0.001, round(aov_res$p, 3))
  
  #make effect column in rownames
  rownames(aov_res) <- aov_res$Effect
  
  #combine df columns
  aov_res$DFn = paste(aov_res$DFn, ', ', aov_res$DFd, sep="")
  
  # remove unnecessary columns
  aov_res <- subset(aov_res, select = -c(Effect, DFd, SSn, SSd,`p<.05`))
  
  #turn to xtable
  aov_table <- xtable(aov_res, digits=c(0,0,2,3,3))
  
  # next convert to xtable
  print(aov_table , type="latex")
}

saveForJasp <- function(df, file){
  #prepare data for jasp (for Bayesian rmANOVA)
  wide <- df
  wide$condition_new <- paste(wide$taskSequence, wide$congruency, wide$switchProp, wide$incongruentProp, sep="_")
  wide <- reshape2::dcast(wide, subject~condition_new,mean,value.var="mean_acc")
  write_csv(wide, file)
}

printEMMeans <- function(aovObj){
  defaultW <- getOption("warn") 
  options(warn = -1) 
  
  # task sequence
  emm <- emmeans(aovObj, ~ taskSequence)
  print(summary(emm))
  
  #congruency
  emm <- emmeans(aovObj, ~ congruency)
  print(summary(emm))
  
  # switchProp
  emm <- emmeans(aovObj, ~ switchProp)
  print(summary(emm))
  
  #incongruentProp
  emm <- emmeans(aovObj, ~ incongruentProp)
  print(summary(emm))
  
  #LWPS
  emm <- emmeans(aovObj, ~ taskSequence * switchProp)
  print(summary(emm))
  
  #LWPC
  emm <- emmeans(aovObj, ~ congruency * incongruentProp)
  print(summary(emm))
  
  #cross interaction
  emm <- emmeans(aovObj, ~ congruency * switchProp)
  print(summary(emm))
  
  emm <- emmeans(aovObj, ~ taskSequence * incongruentProp)
  print(summary(emm))
  
  emm <- emmeans(aovObj, ~ switchProp * incongruentProp)
  print(summary(emm))
  
  options(warn = defaultW)
}

#############################################################
#full data set analysis

all <- read_csv('data/exp1_task_switching/acc_all.csv') %>% 
  mutate(across(c(congruency, taskSequence, subject, switchProp, incongruentProp), as.factor))

all_dfs <- prepareDataSets(all)

#check for normality
sub_means <- all_dfs[[2]]
print(mean(sub_means$mean_acc))
print(sd(sub_means$mean_acc))
hist(sub_means$mean_acc)

#rmANOVA
all_df <- all_dfs[[1]]
allAOV <- aov(mean_acc ~ congruency * taskSequence * switchProp * incongruentProp + 
                Error(subject/(congruency * taskSequence * switchProp * incongruentProp)), 
              data = all_df)
summary(allAOV)

getTableLatex(allAOV)

saveForJasp(all_df, 'data/exp1_task_switching/acc_all_wide.csv')

printEMMeans(allAOV)

write_csv(all_df, "data/exp1_task_switching/acc_table_all.csv")

###########################################################
# diagnostic  data analysis

diagnostic <- read_csv('data/exp1_task_switching/acc_diagnostic.csv') %>% 
  mutate(across(c(congruency, taskSequence, subject, switchProp, incongruentProp), as.factor))

diagnostic_dfs <- prepareDataSets(diagnostic)

#check for normality
sub_means <- diagnostic_dfs[[2]]

print(mean(sub_means$mean_acc))
print(sd(sub_means$mean_acc))
hist(sub_means$mean_acc)

#rmANOVA
diagnostic_df <- diagnostic_dfs[[1]]
diagnosticAOV <- aov(mean_acc ~ congruency * taskSequence * switchProp * incongruentProp + 
                     Error(subject/(congruency * taskSequence * switchProp * incongruentProp)), 
                   data = diagnostic_df)
summary(diagnosticAOV)

getTableLatex(diagnosticAOV)

saveForJasp(diagnostic_df, 'data/exp1_task_switching/acc_diagnostic_wide.csv')

printEMMeans(diagnosticAOV)

write_csv(diagnostic_df, "data/exp1_task_switching/acc_table_diagnostic.csv")

#############################################################
# miscellaneous task code

# three way interaction
emm <- emmeans(allAOV, ~ taskSequence * switchProp * incongruentProp)
emm_res <- summary(emm) %>% 
  group_by(incongruentProp, switchProp) %>% 
  mutate(sum_acc = sum(emmean)) %>% 
  filter(taskSequence == "r") %>% 
  mutate(switch_acc = sum_acc - emmean,
         switch_cost = emmean - switch_acc) 

# 4 way interaction
emm <- emmeans(allAOV, ~ taskSequence * switchProp * incongruentProp * congruency)
emm_res <- summary(emm) %>% 
  group_by(incongruentProp, switchProp, congruency) %>% 
  mutate(sum_acc = sum(emmean)) %>% 
  filter(taskSequence == "r") %>% 
  mutate(switch_acc = sum_acc - emmean,
         switch_cost = emmean - switch_acc) %>% 
  select(switchProp, incongruentProp, congruency, switch_cost) %>% 
  group_by(incongruentProp, congruency) %>% 
  mutate(sum_sc = sum(switch_cost)) %>% 
  filter(switchProp == "25%") %>% 
  mutate(sc_25 = sum_sc - switch_cost,
         sc_diff = switch_cost - sc_25)


acc_counts <- sequence_data %>% 
  group_by(subject, acc) %>% 
  summarise(count = n())
