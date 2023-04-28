library(tidyverse)
library(reshape2) #for the dcast function to get output ready for jasp
library(xtable) #for outputting into latex
library(psychReport) #for getting effect sizes and pretty tables of aov results
library(emmeans) #for getting marginal means
library(psych) #for mauchly.test
options(scipen=999)
setwd("path/to/stability-flexibility-taskswitch-visualsearch")

#' function to do analyze
prepareDataSets <- function(df){
  # get means by subject
  acc_means <- df %>% 
    group_by(subject, distractorType, taskSequence, switchProp, distractorProp) %>% 
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
  wide$condition_new <- paste(wide$taskSequence, wide$distractorType, wide$switchProp, wide$distractorProp, sep="_")
  wide <- reshape2::dcast(wide, subject~condition_new,mean,value.var="mean_acc")
  write_csv(wide, file)
}

printEMMeans <- function(aovObj){
  defaultW <- getOption("warn") 
  options(warn = -1) 
  
  # task sequence
  emm <- emmeans(aovObj, ~ taskSequence)
  print(summary(emm))
  
  #distractorType
  emm <- emmeans(aovObj, ~ distractorType)
  print(summary(emm))
  
  # switchProp
  emm <- emmeans(aovObj, ~ switchProp)
  print(summary(emm))
  
  #distractorProp
  emm <- emmeans(aovObj, ~ distractorProp)
  print(summary(emm))
  
  #LWPS
  emm <- emmeans(aovObj, ~ taskSequence * switchProp)
  print(summary(emm))
  
  #LWPC
  emm <- emmeans(aovObj, ~ distractorType * distractorProp)
  print(summary(emm))
  
  #cross interaction
  emm <- emmeans(aovObj, ~ distractorType * switchProp)
  print(summary(emm))
  
  emm <- emmeans(aovObj, ~ taskSequence * distractorProp)
  print(summary(emm))
  
  emm <- emmeans(aovObj, ~ switchProp * distractorProp)
  print(summary(emm))
  
  options(warn = default)
}

##############################################
# FULL DATA SET
all <- read_csv('data/exp2_additional_singleton/acc_all.csv')
all_dfs <- prepareDataSets(all)

#check for normality
sub_means <- all_dfs[[2]]
print(mean(sub_means$mean_acc))
print(sd(sub_means$mean_acc))
hist(sub_means$mean_acc)

#rmANOVA
all_df <- all_dfs[[1]]
allAOV <- aov(mean_acc ~ distractorType * taskSequence * switchProp * distractorProp + 
                Error(subject/(distractorType * taskSequence * switchProp * distractorProp)), 
              data = all_df)
summary(allAOV)

getTableLatex(allAOV)

saveForJasp(all_df, 'data/exp2_additional_singleton/acc_all_wide.csv')

printEMMeans(allAOV)

write_csv(all_df, "data/exp2_additional_singleton/acc_table_all.csv")

##############################################
# diagnostic data analysis
diagnostic <- read_csv('data/exp2_additional_singleton/acc_diagnostic.csv')
diagnostic_dfs <- prepareDataSets(diagnostic)

#check for normality
sub_means <- diagnostic_dfs[[2]]

print(mean(sub_means$mean_acc))
print(sd(sub_means$mean_acc))
hist(sub_means$mean_acc)

#rmANOVA
diagnostic_df <- diagnostic_dfs[[1]]
diagnosticAOV <- aov(mean_acc ~ distractorType * taskSequence * switchProp * distractorProp + 
                     Error(subject/(distractorType * taskSequence * switchProp * distractorProp)), 
                   data = diagnostic_df)
summary(diagnosticAOV)

getTableLatex(diagnosticAOV)

saveForJasp(diagnostic_df, 'data/exp2_additional_singleton/acc_diagnostic_wide.csv')

printEMMeans(diagnosticAOV)

write_csv(diagnostic_df, "data/exp2_additional_singleton/acc_table_diagnostic.csv")