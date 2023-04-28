library(tidyverse)

#get data
setwd("path/to/stability-flexibility-taskswitch-visualsearch")
df <- read_csv("data/exp2_additional_singleton/raw_task_data.csv") %>% 
  filter(sectionType == 'mainTask') %>% 
  select(c(subject, block, blockType, trialCount, acc, RT, distractorType, taskSequence, sequenceType, sequenceKind, sequencePosition)) %>% 
  mutate(switchProp = ifelse(blockType == "B" | blockType == "D", "75%", "25%")) %>% 
  mutate(distractorProp = ifelse(blockType == "A" | blockType == "B", "75%", "25%"))
str(df)

#accuracy exclusion
acc_cutoff <- .75
accuracies <- df %>% 
  group_by(subject) %>% 
  summarise(mean_acc = mean(acc, na.rm = TRUE)) 
excluded_subs <- accuracies %>% 
  filter(mean_acc < acc_cutoff) %>% 
  select(subject, mean_acc)

# SUBJECT DEMOGRAPHICS NOT AVAILABLE PUBLICALLY
#load demographics data for remaining participants
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

#ALL ACCURACY
acc_all <- df %>% 
  filter(taskSequence != 'n') %>% 
  mutate(across(c(distractorType, taskSequence, switchProp, distractorProp), as.factor))

#DIAGNOSTIC ONLY ACCURACY
acc_diagnostic <- df %>% #30208
  filter(sequenceType == 's') %>% #
  filter(sequencePosition != 1) %>% 
  mutate(across(c(distractorType, taskSequence, switchProp, distractorProp), as.factor))

#ALL REACTION TIME
RT_all <- df %>% #38400
  filter(acc == 1) %>% #35188
  filter((abs(RT - mean(RT,na.rm = TRUE)) <= 3*sd(RT, na.rm = TRUE))) %>%
  filter(RT >= 300) %>% 
  filter(RT <= 2500) %>% #35088
  filter(taskSequence != "n") %>% #34885 
  mutate(across(c(distractorType, taskSequence, switchProp, distractorProp), as.factor))

#DIAGNOSTIC RT
RT_diagnostic <- RT_all %>% 
  filter(sequenceType == 's') %>% 
  filter(sequencePosition != 1) %>% 
  mutate(across(c(distractorType, taskSequence, switchProp, distractorProp), as.factor))

#save data sets
write_csv(acc_all, 'data/exp2_additional_singleton/acc_all.csv')
write_csv(acc_diagnostic, 'data/exp2_additional_singleton/acc_sequence.csv')
write_csv(RT_all, 'data/exp2_additional_singleton/RT_all.csv')
write_csv(RT_sequence, 'data/exp2_additional_singleton/RT_sequence.csv')

#MISC

#CHECK NUMBER OF TRIALS WITHIN CELLS
acc_df_stats <- acc_sequence %>% 
  group_by(subject, distractorType, taskSequence, switchProp, distractorProp) %>% 
  summarise(mean_acc = mean(acc, na.rm = TRUE), n_trials = sum(acc == 1, na.rm=TRUE))

n_conds_acc <- acc_df_stats %>% 
  group_by(subject) %>% 
  summarise(n = n())

RT_df_stats <- RT_sequence %>% 
  group_by(subject, distractorType, taskSequence, switchProp, distractorProp) %>% 
  summarise(mean_RT = mean(acc, na.rm = TRUE), n_trials = sum(acc == 1, na.rm=TRUE))

n_conds_RT <- RT_df_stats %>% 
  group_by(subject) %>% 
  summarise(n = n())

#list of subjects to reject based on not having all cells filled
excluded_subs_2 <- n_conds_RT %>% 
  filter(n < 16) 

#reduce size of RT_sequence
RT_sequence <- RT_sequence %>% 
  filter(! subject %in% excluded_subs_2$subject)

