const { favicons } = require('favicons');
const fs = require('fs');
const path = require('path');

// Source SVG file
const source = './public/favicon-source.svg';

// Configuration
const configuration = {
  path: "/", // Path for generated files
  appName: "LaunchAI",
  appShortName: "LaunchAI",
  appDescription: "From Concept To Launch",
  background: "#0B1121",
  theme_color: "#3b82f6",
  lang: "en-US",
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
  }
};

// Generate the favicons
console.log(`Generating favicons from ${source}...`);

favicons(source, configuration)
  .then(response => {
    // Create the files
    response.images.forEach(image => {
      const filePath = path.join('./public', image.name);
      fs.writeFileSync(filePath, image.contents);
      console.log(`Generated: ${image.name}`);
    });

    // Create manifest files if needed
    response.files.forEach(file => {
      const filePath = path.join('./public', file.name);
      fs.writeFileSync(filePath, file.contents);
      console.log(`Generated: ${file.name}`);
    });

    // Create HTML references (optional)
    const htmlReferences = response.html.join('\n  ');
    console.log('\nHTML references to add to your <head> tag:');
    console.log(htmlReferences);

    console.log('\nFavicons generated successfully!');
  })
  .catch(error => {
    console.error('Error generating favicons:', error);
  }); 