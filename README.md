# natgeo
NatGeo Photo of the day server

Useful to autoupdae you desktop background

## Installation

You should have NodeJS 6+ installed, then:

``` sh
git pull git@github.com:Lianidaz/natgeo.git
cd natgeo
npm i
```
Listens on port 3383 by default, feel free to change it in the last line of app.js

## Endpoints:

### /desktop
> Returns 16:9 picture of the day. Usable with bash/shell/ps1 scripts to set up as a wallpaper


### /mobi
> Returns an image cropped to be used as adequate mobile device background, ratio is 1:0.7

## IMPORTANT!
If you would like to use it with IFTTT app - you must put it behind reverse proxy with valid certificate.

### Disclamer

Uses national-geographic-api npm package by crisboarna, use reasonably.