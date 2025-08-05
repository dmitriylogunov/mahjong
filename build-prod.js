const fs = require('fs');
const path = require('path');

// Create dist directory structure
const distDir = path.join(__dirname, 'dist');
const vendorDir = path.join(distDir, 'vendor');

// Create directories
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}
if (!fs.existsSync(vendorDir)) {
    fs.mkdirSync(vendorDir);
}

// Copy vendor dependencies
const dependencies = [
    { from: 'node_modules/core-js/client/shim.min.js', to: 'vendor/shim.min.js' },
    { from: 'node_modules/zone.js/dist/zone.js', to: 'vendor/zone.js' },
    { from: 'node_modules/systemjs/dist/system.src.js', to: 'vendor/system.src.js' },
    { from: 'node_modules/createjs-soundjs/lib/soundjs-0.6.2.min.js', to: 'vendor/soundjs-0.6.2.min.js' },
    { from: 'node_modules/createjs-preloadjs/lib/preloadjs-0.6.2.min.js', to: 'vendor/preloadjs-0.6.2.min.js' },
    { from: 'node_modules/csshake/dist/csshake.min.css', to: 'vendor/csshake.min.css' }
];

// Angular dependencies to copy
const angularDeps = [
    '@angular/core/bundles/core.umd.js',
    '@angular/common/bundles/common.umd.js',
    '@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http/bundles/http.umd.js',
    '@angular/router/bundles/router.umd.js',
    '@angular/forms/bundles/forms.umd.js',
    'angular-in-memory-web-api/bundles/in-memory-web-api.umd.js'
];

// Copy dependencies
dependencies.forEach(dep => {
    const srcPath = path.join(__dirname, dep.from);
    const destPath = path.join(distDir, dep.to);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${dep.from} to ${dep.to}`);
    } else {
        console.error(`File not found: ${dep.from}`);
    }
});

// Copy Angular dependencies
angularDeps.forEach(dep => {
    const srcPath = path.join(__dirname, 'node_modules', dep);
    const destPath = path.join(vendorDir, dep);
    const destDir = path.dirname(destPath);
    
    // Create directory structure
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${dep}`);
    } else {
        console.error(`File not found: ${dep}`);
    }
});

// Copy src directory contents
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName),
                            path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

// Copy all src contents
copyRecursiveSync(path.join(__dirname, 'src'), distDir);

// Copy rxjs directory
copyRecursiveSync(path.join(__dirname, 'node_modules/rxjs'), path.join(vendorDir, 'rxjs'));

// Update index.html for production
const indexPath = path.join(distDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace node_modules paths with vendor paths
indexContent = indexContent.replace('node_modules/csshake/dist/csshake.min.css', 'vendor/csshake.min.css');
indexContent = indexContent.replace('node_modules/core-js/client/shim.min.js', 'vendor/shim.min.js');
indexContent = indexContent.replace('node_modules/zone.js/dist/zone.js', 'vendor/zone.js');
indexContent = indexContent.replace('node_modules/systemjs/dist/system.src.js', 'vendor/system.src.js');
indexContent = indexContent.replace('node_modules/createjs-soundjs/lib/soundjs-0.6.2.min.js', 'vendor/soundjs-0.6.2.min.js');
indexContent = indexContent.replace('node_modules/createjs-preloadjs/lib/preloadjs-0.6.2.min.js', 'vendor/preloadjs-0.6.2.min.js');

fs.writeFileSync(indexPath, indexContent);
console.log('Updated index.html for production');

// Create production systemjs.config.js
const systemJsConfig = `(function (global) {
  System.config({
    paths: {
      'npm:': 'vendor/'
    },
    map: {
      app: 'app',
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      'rxjs': 'npm:rxjs',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js'
    },
    packages: {
      app: {
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      }
    }
  });
})(this);`;

fs.writeFileSync(path.join(distDir, 'systemjs.config.js'), systemJsConfig);
console.log('Created production systemjs.config.js');

console.log('\nProduction build complete! Deploy the contents of the dist/ directory.');

// List dist contents for debugging
console.log('\nDist directory contents:');
try {
    const distContents = fs.readdirSync(distDir);
    console.log(distContents);
    console.log(`Total files in dist: ${distContents.length}`);
    console.log(`Dist directory exists: ${fs.existsSync(distDir)}`);
    console.log(`Dist directory path: ${distDir}`);
} catch (err) {
    console.error('Error reading dist directory:', err);
}