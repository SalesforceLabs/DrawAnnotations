sfdx force:org:create -f config/project-scratch-def.json -d 1 -s -w 60

sfdx force:source:push

# apply the user permissions
sfdx force:user:permset:assign -n Draw_Annotation
sfdx force:user:permset:assign -n Test_App

# export the data
# sfdx force:data:tree:export -q ./data/drawings.soql -d ./data/ -p
sfdx force:data:tree:import -p ./data/Drawing__c-plan.json

sfdx force:org:open -p lightning/o/Drawing__c/list?filterName=All

# run tests (no aura components are used)
# sfdx force:lightning:lwc:test:run --coverage
# sfdx force:apex:test:run -c -r human
