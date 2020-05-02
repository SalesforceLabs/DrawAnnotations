sfdx force:org:create -f config/project-scratch-def.json -d 1 -s -w 60

sfdx force:source:push

# apply the user permissions
sfdx force:user:permset:assign -n Draw_Annotation
sfdx force:user:permset:assign -n Test_App

# export the data
# sfdx force:data:tree:export -q ./data/drawings.soql -d ./data/ -p
sfdx force:data:tree:import -p ./data/Drawing__c-plan.json

sfdx force:org:open -p lightning/o/c25draw__Drawing__c/list?filterName=All

# run tests (no aura components are used)
# sfdx force:lightning:lwc:test:run --coverage
# sfdx force:apex:test:run -c -r human

# packge lifecycle commands
# for below, the -w ensures the sfdx-project.json file is updated with the packageid of the version
# sfdx force:package:version:create -p "DrawAnnotations" -x -c -w 10
# sfdx force:org:create -a drawtests -f ./config/project-scratch-def.json -n 
# sfdx force:package:install -p "DrawAnnotations@1.0.0-1" -u drawtests
# sfdx force:org:open -u drawtests
# sfdx force:package:uninstall -p "DrawAnnotations@1.0.0-1" -u drawtests
# sfdx force:package:version:promote -p "DrawAnnotations@1.0.0-1"
