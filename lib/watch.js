const fs = require('fs');
const cheerio = require('cheerio');
const util = require('./utilities');

var old_headlines = JSON.parse(fs.readFileSync('var/abc.old.json', {encoding:"utf8"}));


function headlines(fileEvent) {
  fs.watch('var/abc.html', function(eventType, filename) {
    fs.promises.readFile(`var/${filename}`, {encoding:"utf8"})
      .then(function(data) {
        var new_file = data;
        // Use Cheerio to pull headlines of interest
        let qs = cheerio.load(new_file);
        let headlines = [];
        qs('.headlines-ul li a').each(function(i,elem){
          var data = qs(elem);
          var headline = {};
          headline.text = data.text().trim();
          headline.url = data.attr('href').trim();
          headlines.push(headline);
        });

        // Compare the old headlines with the new; return the new ones
        let new_headlines = util.findUniqueObjects(headlines,old_headlines,'url');

        // Only proceed if there are new headlines to work with
        if (new_headlines.length > 0) {
          // Process headlines into an HTML payload
          let html_headlines = new_headlines.map(function(hl) {
            return `<li><a href="${hl.url}">${hl.text}</a></li>`;
          });

          fileEvent.emit('new headlines', html_headlines);
          old_headlines = headlines;
          // Write latest headlines to files
          fs.promises.writeFile('var/abc.latest.json', JSON.stringify(new_headlines), {encoding:"utf8"});
          fs.promises.writeFile('var/abc.old.json', JSON.stringify(headlines), {encoding:"utf8"});
        }
      });
    });
}

module.exports = {
  headlines
}
