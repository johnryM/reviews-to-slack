//dependencies
var moment = require("moment");
var googlePlayScraper = require("google-play-scraper");

var connectionValues = require("./data.json");
// var MY_SLACK_WEBHOOK_URL = connectionValues.webhookUrl;
var MY_SLACK_WEBHOOK_URL = process.env.WEBHOOK;
var slack = require("slack-notify")(MY_SLACK_WEBHOOK_URL);

var testChannel = process.env.TESTCHANNEL;
var reviewChannel = process.env.LIVECHANNEL;

var formatString = "MMM Do YYYY";

var appIdArray = [
    {id: 'bbc.mobile.news.uk', name: 'BBC UK', flag:':flag-gb:'},
    {id: 'bbc.mobile.news.ww', name: 'BBC GNL', flag:':flag-us:'},
    {id: 'uk.co.bbc.mundo', name: 'BBC Mundo', flag:':flag-es:'},
    {id: 'uk.co.bbc.hindi', name: 'BBC Hindi' , flag:':flag-in:'},
    {id: 'uk.co.bbc.russian', name: 'BBC Russian', flag:':flag-ru:'},
    {id: 'uk.co.bbc.arabic', name: 'BBC Arabic', flag:':flag-sa:'},
    {id: 'bbc.news.mobile.cymru', name: 'BBC Cymru Fyw', flag:':welsh-flag:'}
];

var reviewSlack = slack.extend({
    channel: testChannel,
    icon_emoji: ':robot:',
    username: 'Android Reviews Bot',
    icon_emoji: ':robot:'
});

sendIntroTitle();
iterateAppReviews();

//Go through the array of newsapps using a scraper that uses the apps id to retrive reviews from the play store website
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
                //console.log("title " + array[i].title);
                console.log(JSON.stringify(array[i]));
                reviewSlack({
                    attachments: [
                        {
                            color: getReviewColor(array[i].score),
                            fields: [
                                {
                                    title: appId.name + " " + appId.flag,
                                    value: getEmojiStar(array[i].score) + "\n" +
                                        array[i].title + "\n" +
                                        array[i].text + "\n" +
                                        "~by " + array[i].userName + "~"
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
    var yesterdayDate = getYesterdaysDate();

    var resultArray = [];
    for(var i = 0; i < data.length; i++) {
        // var dataDate = new Date(data[i].date).getDate();
        var reviewDate = moment(new Date(data[i].date)).format(formatString);
        if (reviewDate == yesterdayDate) {
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

// green for good reviews , yellow for meh review, red for bad reviews
function getReviewColor(score) {
    var parsedScore = parseInt(score);
    switch (parsedScore) {
        case 5:
        case 4:
            return '#2ECC71';
            break;
        case 3:
            return '#FFFF33';
        case 2:
        case 1:
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

function getYesterdaysDate() {
    return moment().subtract(1, 'days').format(formatString);
}

function sendIntroTitle() {
    slack.send({
        channel: testChannel,
        icon_emoji: ':robot:',
        username: 'Android Reviews Bot',
        text: 'Reviews for ' + getYesterdaysDate()
    });
}
