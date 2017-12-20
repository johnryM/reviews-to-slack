# Reviews to Slack

Deployed using Heroku and uses config vars to obfuscate the slack webhook and channels used.

## How to

Set up the following config vars in Heroku via CLI or dashboard

~~~~
    key = WEBHOOK | VALUE = https://hooks.slack.com/services/....
    key = TESTCHANNEL | VALUE =  #bleh
    key = LIVECHANNEL | VALUE = #blah
~~~~
