# Synth Rider Competitive Bot
A bot for the Synth Rider Competitive Discord Server.

This bot was created to create server events and log when everyonw could play.
It gives a nice output in the form of an image that shows the asked for information depending on what command was used.

This is free for everyone to use

## NOTE
This bot does not work anymore because of how discord wants to set up bots.

It is not impossible to fix but may require time to go through this horrible code.

## Installation
[MySQL Installer](https://dev.mysql.com/downloads/installer/) In the installer you need:

1. "MySQL Server" Version 8.0.20 or later

2. "Connector/J" Version 8.0.20 or later (Not tried without it so it might work without it)

3. (Optional) "MySQL Workbench" version 8.0.20 or later (Makes it easier to use MySQL)

[Node.js](https://nodejs.org/en/) Install the latest LTS version

Something to edit code with such as Visual Studio Code or Atom

[Visual Studio Code](https://code.visualstudio.com/download) or [Atom](https://atom.io/) (These are optional if you already have something)

## MySQL start guide

1. Create a database name MUST BE "discorddatabase"

2. Import the sql files in the "discorddatabase" database

## Create your bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create an application and go in there

2. Go to the "Bot" tab on the left and fix the name and picture

3. Click "Click to Reveal Token" and copy that or just click the "Copy" button. You need to insert that into the variable "token" in the index.js file

4. Go to "OAuth2" and in "scopes" select "Bot". A new tab opend below where you can set the permissions for your bot. It will create a link above which is the invite link. Copy that

5. Paste the link in a new tab in your browser and select what server it will go to.

## How to start the bot

1. Create a folder where you can find it and put every file there besides the database files

2. Navigate to that folder with CMD

3. Write "node." and the bot should start

**NOTE: If that don't work follow this insted:**

1. Navigate to the bot folder in CMD

2. Write "npm init" and just press enter besides maybe "Author" where you can put your name or my name if you want (SnowyPlums).

3. Write "npm install discord.js" wait for it to install

4. Write "npm install canvas" wait for it to install

5. Write "npm install mysql" wait for it to install

6. Write "node." and the bot should start
