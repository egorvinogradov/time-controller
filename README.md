Time Controller
============

User script that prevents spending too much time on time-killing sites like Facebook or Youtube (20 minutes a day by default). When time expires, extension automatically redirects to a specified URL.

#### Installation for Chrome

1. Install [Tampermonkey Extension](http://bit.ly/1z9eEsU)
2. Go to Tampermonkey options
3. Click icon with plus sign to install a new script
4. Copy `time-controller.user.js` contents from repository and paste into a new script window
5. Change default variables if necessary (description below)
6. Save by clicking floppy disk icon

#### Default variables

* `DAY_LIMIT_MINUTES` - time limit in minutes a day to spend on each site (20 by default).
* `DOMAINS` - array of second-level domains to watch ([facebook.com](http://facebook.com) and [youtube.com](http://youtube.com) by default).
* `REDIRECT_PAGE` - URL where script sends after time is expired ([picture about procrastination](http://bit.ly/1sTtwbW) by default)
