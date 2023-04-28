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
  RT_means <- df %>% 
    group_by(subject, distractorType, taskSequence, switchProp, distractorProp) %>% 
    summarise(mean_RT = mean(RT, na.rm = TRUE))
  
  RT_sub_means <- df %>% 
    group_by(subject) %>% 
    summarise(mean_RT = mean(RT, na.rm = TRUE))
  
  return(list(RT_means = RT_means, sub_means = RT_sub_means))
}

#' function to create latex code for table
getTableLatex <- function(aovObj){
  #using psychReport instead to get partial eta squared and fix p values
  aovRT <- aovEffectSize(aovObj)$ANOVA
  aovRT$p = ifelse(round(aovRT$p, 3) == 0, 0.001, round(aovRT$p, 3))
  
  #make effect column in rownames
  rownames(aovRT) <- aovRT$Effect
  
  #combine df columns
  aovRT$DFn = paste(aovRT$DFn, ', ', aovRT$DFd, sep="")
  
  # remove unnecessary columns
  aovRT <- subset(aovRT, select = -c(Effect, DFd, SSn, SSd,`p<.05`))
  
  #turn to xtable
  aov_table <- xtable(aovRT, digits=c(0,0,2,3,3))
  
  # next convert to xtable
  print(aov_table , type="latex")
}

saveForJasp <- function(df, file){
  #prepare data for jasp (for Bayesian rmANOVA)
  wide_RT <- df
  wide_RT$condition_new <- paste(wide_RT$taskSequence, wide_RT$distractorType, wide_RT$switchProp, wide_RT$distractorProp, sep="_")
  wide_RT <- reshape2::dcast(wide_RT, subject~condition_new,mean,value.var="mean_RT")
  write_csv(wide_RT, file)
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
  
  options(warn = defaultW)
}

########################################
# FULL DATA SET ANALYSIS
all <- read_csv('data/exp2_additional_singleton/RT_all.csv')

# Same for full data set
all_dfs <- prepareDataSets(all)

#check for normality
sub_means <- all_dfs[[2]]

print(mean(sub_means$mean_RT))
print(sd(sub_means$mean_RT))
hist(sub_means$mean_RT)


all_df <- all_dfs[[1]]

allAOV <- aov(mean_RT ~ distractorType * taskSequence * switchProp * distractorProp + 
                Error(subject/(distractorType * taskSequence * switchProp * distractorProp)), 
              data = all_df)
summary(allAOV)

getTableLatex(allAOV)

saveForJasp(all_df, 'data/exp2_additional_singleton/RT_all_wide.csv')

printEMMeans(allAOV)

write_csv(all_df, "data/exp2_additional_singleton/RT_table_all.csv")

########################################
# diagnostic data analysis
diagnostic <- read_csv('data/RT_diagnostic.csv')
diagnostic_dfs <- prepareDataSets(diagnostic)

#check for normality
sub_means <- diagnostic_dfs[[2]]

print(mean(sub_means$mean_RT))
print(sd(sub_means$mean_RT))
hist(sub_means$mean_RT)

diagnostic_df <- diagnostic_dfs[[1]]

diagnosticAOV <- aov(mean_RT ~ distractorType * taskSequence * switchProp * distractorProp + 
                     Error(subject/(distractorType * taskSequence * switchProp * distractorProp)), 
                   data = diagnostic_df)
summary(diagnosticAOV)

getTableLatex(diagnosticAOV)

saveForJasp(diagnostic_df, 'data/exp2_additional_singleton/RT_diagnostic_wide.csv')

printEMMeans(diagnosticAOV)

write_csv(diagnostic_df, "data/exp2_additional_singleton/RT_table_diagnostic.csv")


