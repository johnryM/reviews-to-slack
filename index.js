var repeat = require("repeat");
var connectionValues = require("./data.json");
var googlePlayScraper = require("google-play-scraper");
var MY_SLACK_WEBHOOK_URL = connectionValues.webhookUrl;
var slack = require("slack-notify")(MY_SLACK_WEBHOOK_URL);

var testChannel = connectionValues.testChannel;
var reviewChannel = connectionValues.liveChannel;

var appIdArray = [
    {id: 'bbc.mobile.news.uk', name: 'BBC UK'},
    {id: 'uk.co.bbc.mundo', name: 'BBC Mundo'},
    {id: 'uk.co.bbc.hindi', name: 'BBC Hindi'},
    {id: 'uk.co.bbc.russian', name: 'BBC Russian'},
];

var reviewSlack = slack.extend({
channel: testChannel,
icon_emoji: ':cake:',
username: 'android review bot'
});

var interval = 24;
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

            for(var i=0;i < array.length; i++) {
                reviewSlack({
                    text: 'Android reviews from yesterday',
                    attachments: [
                        {
                            color: getReviewColor(array[i].score),
                            fields: [
                                {
                                    title: appId.name,
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
    var currentDate = new Date().getDate();
    var yesterdayDate = new Date().getDate() - 1;


    var resultArray = [];

    for(var i = 0; i < data.length; i++) {
        var dataDate = new Date(data[i].date).getDate();
        if (dataDate == yesterdayDate) {
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
