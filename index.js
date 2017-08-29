// data for config
var connectionValues = require("./data.json");

// deps
var repeat = require("repeat");
var googlePlayScraper = require("google-play-scraper");
var slack = require("slack-notify")(connectionValues.webhookUrl);

var testChannel = connectionValues.testChannel;
var reviewChannel = connectionValues.liveChannel;

var appIdArray = [
    {id: 'bbc.mobile.news.uk', name: 'BBC UK', flag: ':flag-gb:'},
    {id: 'bbc.mobile.news.cymru', name: 'BBC Cymru Fyw', flag: ':flag-gb:'},
    {id: 'bbc.mobile.news.ww', name: 'BBC WW', flag: ':flag-us:'},
    {id: 'uk.co.bbc.mundo', name: 'BBC Mundo', flag: ':flag-es:'},
    {id: 'uk.co.bbc.hindi', name: 'BBC Hindi', flag: ':flag-in:'},
    {id: 'uk.co.bbc.russian', name: 'BBC Russian', flag: ':flag-ru:'}
];

var reviewSlack = slack.extend({
channel: testChannel,
icon_emoji: ':robot_face:',
username: 'Review Bot'
});

var interval = 1;
var timeUnit = 'hours';
repeat(iterateAppReviews).every(interval, timeUnit).start.now();

function iterateAppReviews() {
    appIdArray.forEach(function(appId) {
        var results = googlePlayScraper.reviews({
            appId: appId.id,
            page:0,
            sort: googlePlayScraper.sort.NEWEST
        }).then(function(data) {return data;});

        results.then(
        function(data) {
            var array = getReviews(data);

            if (array.length == 0) {
                console.log("No Reviews found on " + new Date().getDate());
                return;
            }

            for(var i=0;i < array.length; i++) {
                reviewSlack({
                    text: 'Latest Android reviews',
                    attachments: [
                        {
                            color: getReviewColor(array[i].score),
                            fields: [
                                {
                                    title: appId.name + " " + appId.flag,
                                    value: getEmojiStar(array[i].score) + "\n" +
                                        array[i].title + "\n" +
                                        array[i].text
                                }
                            ]
                        }
                    ]
                });
            }
        },
        function(data) {
            console.log("rejection error");
        });
    });
}


function getReviews(data) {
    var now = new Date().getDate();
    var hourInMilis = 60 * 60 * 1000;
    var anHourAgo = now - hourInMilis;

    var resultArray = [];

    for(var i = 0; i < data.length; i++) {
        var dataDate = new Date(data[i].date).getDate();
        if (dataDate <= now && dataDate >= anHourAgo) {
            review = data[i];
            resultArray.push({
                score: review.score,
                userName: review.userName,
                title: review.title,
                text: review.text,
                date: review.date
            });
        }
    }
    return resultArray;
}

function getReviewColor(score) {
    var parsedScore = parseInt(score);
    if (parsedScore >= 3) {
        return '#2ECC71';
    } else {
        return '#BB1919';
    }
}

function getEmojiStar(score) {
    var parsedScore = parseInt(score);
    var starString = ':star:';
    for(var i=1;i < parsedScore;i++) {
        starString = starString + ' :star:';
    }
    return starString;
}
