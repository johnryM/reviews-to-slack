# Reviews to Slack

Deployed using Heroku and uses config vars to obfuscate the slack webhook and channels used.

## How to

Set up the following config vars in Heroku via CLI or dashboard

~~~~
    key = LIVEWEBHOOK | VALUE = https://hooks.slack.com/services/[your actual review slack channel]
    key = TESTWEBHOOK | VALUE = https://hooks.slack.com/services/[testing slack channel so your team doesn't hate you]
    key = TESTCHANNEL | VALUE =  #bleh
    key = LIVECHANNEL | VALUE = #blah
~~~~

Once your Heroku instance is up and running, add a scheduler to it, add a job named `getReviews` and set it to run daily.
