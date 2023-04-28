library(tidyverse)

#get data
setwd("path/to/stability-flexibility-taskswitch-visualsearch/")
df <- read_csv("data/exp1_task_switching/raw_task_data.csv") %>% 
  filter(sectionType == 'mainTask') %>% 
  select(c(subject, block, blockType, trialCount, acc, RT, congruency, cuedTask, taskSequence, sequenceType, sequenceKind, sequencePosition)) %>% 
  mutate(switchProp = ifelse(blockType == "B" | blockType == "D", "75%", "25%")) %>% 
  mutate(incongruentProp = ifelse(blockType == "A" | blockType == "B", "75%", "25%"))
str(df)

#accuracy exclusion
acc_cutoff <- .75
accuracies <- df %>% 
  group_by(subject) %>% 
  summarise(mean_acc = mean(acc, na.rm = TRUE)) 
excluded_subs <- accuracies %>% 
  filter(mean_acc < acc_cutoff) %>% 
  select(subject, mean_acc)

# DEMOGRAPHIC DATA NOT AVAILABLE PUBLICALLY
#load demographics data
demos <- read_csv('data/SubjectInfo.csv') %>% 
  filter(! workerID %in% excluded_subs$subject)

get_sub_info <- function(demo){
  print("Sex")
  print(paste('F: ',sum(demo$Gender == 'F', na.rm=TRUE), sep=""))
  print(paste('M: ',sum(demo$Gender == 'M', na.rm=TRUE), sep=""))
  print('Age')
  print(paste('Min: ', min(demos$Age, na.rm=TRUE), sep=""))
  print(paste('Max: ', max(demos$Age, na.rm=TRUE), sep=""))
  print(paste('Mean: ', mean(demos$Age, na.rm=TRUE), sep=""))
  print(paste('SD: ', sd(demos$Age, na.rm=TRUE), sep=""))
}

get_sub_info(demos)

#remove subject names (irrelevant after this)
df <- df %>% 
  filter(! subject %in% excluded_subs$subject)

#accuracy
acc_all <- df %>% 
  filter(taskSequence != 'n')

#save acc all
write_csv(acc_all, 'data/exp1_task_switching/acc_all.csv')
  
#and remove filler trials
acc_sequence <- df %>% #30208
  filter(sequenceType == 's') %>% #15104
  filter(sequencePosition != 1) #11328

# save data
write_csv(acc_sequence, 'data/exp1_task_switching/acc_diangostic.csv')

#RT all
RT_all <- df %>% #36480
  filter(acc == 1) %>% #32416
  filter((abs(RT - mean(RT,na.rm = TRUE)) <= 3*sd(RT, na.rm = TRUE))) %>% #32385
  filter(RT >= 300) %>% 
  filter(RT <= 1500) %>% #32349
  filter(taskSequence != "n") #32186

write_csv(RT_all, 'data/exp1_task_switching/RT_all.csv')

#RT diagnostic analysis
RT_diagnostic <- RT_all %>% 
  filter(sequenceType == 's') %>% #exclude non-diagnostic trials
  filter(sequencePosition != 1) #exclude first trial of each sequence

write_csv(RT_diagnostic, 'data/exp1_task_switching/RT_diagnostic.csv')

#check number of trials per cell
acc_df_stats <- acc_sequence %>% 
  group_by(subject, congruency, switchType, switchProp, incongruentProp) %>% 
  summarise(mean_acc = mean(acc, na.rm = TRUE), n_trials = sum(acc == 1, na.rm=TRUE))

n_conds_acc <- acc_df_stats %>% 
  group_by(subject) %>% 
  summarise(n = n())

RT_df_stats <- RT_sequence %>% 
  group_by(subject, congruency, switchType, switchProp, incongruentProp) %>% 
  summarise(mean_RT = mean(acc, na.rm = TRUE), n_trials = sum(acc == 1, na.rm=TRUE))

n_conds_RT <- RT_df_stats %>% 
  group_by(subject) %>% 
  summarise(n = n())

#check frequency of tasks
task_counts <- df %>% 
  group_by(subject, blockType, cuedTask) %>% 
  summarise(n = n())


calc_percent_loss <- function(high, low){
  round((high - low) / high * 100, 1)
}