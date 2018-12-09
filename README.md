# ng-hot-css
Angular development server with instant style refresh. Supports CSS / LESS / SCSS preprocessors.

This package is intended to speed up the development process by providing instant feedback upon style changes.

Setup:
  1. Install the package globally        
      `npm i -g ng-hot-css`
      
  2. Create a new Angular project. To use this package you'll need to select one of the following stylesheet formats:    
      `CSS`  
      `SCSS`  
      `LESS`
  
  3. From the new project root directory link the globally installed package to local node_modules        
      `npm link ng-hot-css`
      
  4. In the development environmet TypeScript file (<project dir>/src/environments/environment.ts) add the following import statement  
      `import 'ng-hot-css/fe-scripts/ng-hot.min.js';`
      
  5. From the project root directory run initiate the development server        
      `ng-hot`
      
  6. The default development server port is 4200. If this port is unavailable on your system you can provide it like so:        
      `ng-hot -p <port number>`
      
  6. You should see "Building Angular server. Please wait..."
  7. Once the server is initiated updating the styles of the project should instantly update any open browser tabs (including ones opened on mobile) without refreshing the page
  8. Updating all other files (HTML/TS/JSON etc.) will rebuild the project and refresh the browser (as `ng serve` normally would)
  
---

Notes:
  1. This package does not replicate Angular-style CSS layout exactly. Mainly the "_ngcontent-c1" "_ngcontent-c2" etc. component-specific tags are omitted. Therefore you can change component CSS from another component by using the same CSS selectors. Try to avoid using the same selectors and always run `ng build` which will build the App with component-specific tags before you deploy it.
  2. This package is not intended as a replacement for `ng build`. Always use the utilities provided by Angular for deploying the App to production environments.
