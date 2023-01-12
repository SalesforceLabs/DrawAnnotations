# DrawAnnotations

Home: [https://github.com/SalesforceLabs/DrawAnnotations](https://github.com/SalesforceLabs/DrawAnnotations)

Provides a nice drawing surface for your needs. Leverages [fabric.js](http://fabricjs.com/) for powering the Canvas capabilities. Key features:

* Drawing mode, with shapes and free drawing
* Stamping mode, for simple interaction to indicate key points, like on an image
* Record Home: live loading and saving of canvas
* Flow Screen: Provides both JSON and Image to consume as needed from the flow

## Deploy to Own Scratch Org

Use the script at [orgInit.sh](orgInit.sh):
Note: you may have to make the file executable, for example like in the Apple support docs: [Make a file executable in Terminal on Mac](https://support.apple.com/guide/terminal/make-a-file-executable-apdd100908f-06b3-4e63-8a87-32e71241bab4/mac)

```sh
./orgInit.sh
```

Or manual steps as documented in the script file above.

## Local Dev of LWC

Be sure to follow the steps here for local dev setup: [https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_local_dev_setup](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_local_dev_setup)

Once it is set up, you can run the commands from VS Code (Start Local Dev Server/Stop Local Dev Server) or you can run the manual steps here:

```sh
sfdx force:lightning:lwc:start
open http://localhost:3333/
```
