/*
This code is by no mean perfect and needs to be improved a lot. This code is very confusing even for me but if you need help you can contact me here: Discord: ※ Yuri ※#5259

Found FEEDBACK:
1. Instead of checking each char if it's a word args would be better. How to here: https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments
2. Make commands more uniform to merge code better
*/

///////////////////////Packages Used Goes Here//////////////////////////////////
const Discord = require('discord.js');
const bot = new Discord.Client();

const Canvas = require('canvas');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',            //Database connection (public ip or localhost)
  user: 'DiscordBot',           //Database login Username
  password: 'DiscordBot',       //Database login Password
  database: 'discorddatabase'   //Database Name
});
////////////////////////////////////////////////////////////////////////////////

const token = '???'; //Replace "???" for your bot token

const prefix = '!';   //What to write in the beginning of a command

var days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]; //Used to check if there is an event on a day

/////////////////////Will always run when the bot starts////////////////////////
bot.on('ready', () => {
  console.log('The bot is online!');

  //Functioin checks if an event has started
  function checkEvent() {
    var date = new Date();

    //Needs day and hour for if an event has started
    var currentDay = date.getDay();
    var h = date.getHours()-2; //"-2" To convert gmt+2 timezone to UTC timezone. Needs to be changed for another timezone (Bot timezone)

    //If bot time is < 0 needs to +24 hours
    if (h < 0) { //If you use a timezone where you have - in time from UTC change "+" to "-" and "-" to "+". Also change "if (h < 0)" to "if (h > 24)" (This was not been tested)
      h += 24;
      currentDay -= 1;
      if (currentDay < 0) {
        currentDay += 7;
      }
    }

      var day = days[currentDay]; //Because "currentDay" is just a number we use the array above (row 28) to make a word
      connection.query(`SELECT * FROM event WHERE day = '${day}'`, (err, rows) => { //day is used as the condition to find the event from the table "event"
        if (err) throw err;

        else {
          //If there are more than one event on the day we check all of them
          //NOTE: "rows" are the number of events created on the day
          for (var j = 0; j < rows.length; j++) {
            var start = rows[j].start; //Start time of the event
            var end = rows[j].end;     //End time of the event

            //*********Check for is the event created is using am/pm**********//
            var startTime = rows[j].startTime;
            var endTime = rows[j].endTime;

            if (startTime == "am" || startTime == "pm") {
              if (startTime == "pm") {
                start += 12; //Not sure what I did here but I guess it works
              }
              if (endTime == "am" && startTime == "pm") { //This is a dumb check but it could happen
                end += 24;
              }
              else if (endTime == "pm") {
                end += 12;
              }
            }
            //****************************************************************//
            else {
              if (end < start) {
                end += 24;
              }
            }
            if (h >= start && h <= end) {
              connection.query(`SELECT * FROM ${day}`, (err, rows) => { //Check each user with a time on the event day
                if (err) throw err;

                else if (rows.length < 1) {

                }
                else {
                  var text = ""; //Output text

                  if (startTime == "pm" && endTime == "am" || startTime == "am" && endTime == "am") {
                    end += 24;
                  }
                  else if (startTime != "pm" && startTime != "am" && start > end) {
                    end += 24;
                  }
                  else if (endTime == "pm") {
                    end += 12;
                  }

                  if (startTime == "pm") {
                    start += 12;
                  }

                  for (var i = 0; i < rows.length; i++) { //Check each user who has a time on the event day
                    let userID = rows[i].id;            //Gets users Discord ID

                    let userStart = rows[i].start;      //Gets users start time
                    let userEnd = rows[i].end;          //Gets users end time

                    let startZone = rows[i].startTime;  //If users is using am/pm
                    let endZone = rows[i].endTime;      //If users is using am/pm

                    //Check for if the users is using am/pm and will convert it to 24h time
                    if (startZone == "pm") {
                      userStart += 12;
                    }
                    if (endZone == "pm") {
                      userEnd += 12;
                    }

                    if (startZone == "pm" && endZone == "am" || startZone == "am" && endZone == "am") {
                      userEnd += 24;
                    }
                    else if (startZone != "pm" && startZone != "am" && userStart > userEnd) {
                      userEnd += 24;
                    }
                    //If the user has a time within the event they will be added to the output text
                    if (userStart >= start && userStart <= end || userEnd >= start && userEnd <= end) {
                      text += "<@" + userID + ">\n";
                    }
                  }
                  const channel = bot.channels.cache.get('719211993214746655'); //The number "719211993214746655" refers to the text channel it should send in
                  channel.send("**An event will now start so be there all of you!**\n" + text); //Send text in the specified text channel
                }
              });

              connection.query(`SELECT * FROM event WHERE day = '${day}'`, (err, rows) => {
                if (err) throw err;

                else {
                  //When the event has been called it will be removed from the database
                  sql = `DELETE FROM discorddatabase . event WHERE day = '${day}'`;
                  console.log("The event that started on: **" + day + "** has been removed");
                  connection.query(sql);
                }
              });
            }
          }
        }
      });
    setTimeout(checkEvent, 60000); //Update every min
  }
  checkEvent();
});
////////////////////////////////////////////////////////////////////////////////

bot.on('message', async msg =>{
  if (msg.channel.id != 717502869909143712 && msg.channel.id != 719211993214746655) { //Numbers are representing the text channel id where it can look for commands

  }
  else {
    ///////////////Fix so that the prefix is not part of the text///////////////
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(' ');
    var input = args.toString().toLowerCase();
    ////////////////////////////////////////////////////////////////////////////

    //Variables to store commands. NOTE: Can be changed to a more otimized way using args
    var start = "";
    var end = "";
    var startTime = "";
    var endTime = "";

    var checkInt = true;
    var time24 = false;

    var space = 0;

    //Check first input. Should be the table name
    //These can also be better optimized
    var tableName = "";
    for (var i = 0; i < input.length; i++) {
      if (input.charAt(i) == ',') {
        i = input.length;
      }
      else {
        tableName += input.charAt(i);
      }
    }

    //Second input should be what command it should do such as: add, remove
    var command = "";
    for (var i = tableName.length + 1; i < input.length; i++) {
      if (input.charAt(i) == ',') {
        i = input.length;
      }
      else {
        command += input.charAt(i);
      }
    }

    //FollowUp is just if the needs to be a second command such if the "command" is event then "followUp" could be add
    var followUp = "";
    for (var i = tableName.length + command.length + 2; i < input.length; i++) {
      if (input.charAt(i) == ',') {
        i = input.length;
      }
      else {
        followUp += input.charAt(i);
      }
    }

    //Function to check if a character is a number
    function isNumeric(s) {
      return !isNaN(s - parseFloat(s));
    }
    //Function to check if the number is even
    function isEven(n) {
      return Math.abs(n % 2) == 1;
    }

    //For the user who don't know the bot can use the command "help"
    if (tableName == "help") {
      msg.author.send("```I am currently in a testing phase so please be kind\n\n1. Add timefrme: \n!mon add 5-12\n\n2. Update timeframe: \n!sun update 5pm-12am\n\n3. Remove timeframe: \n!thu remove\n\n4. Show timeframes: \n!fri show\n\n5. Create a community event: \n!sat event 20-22\n\ndays to choose from:\nmon\ntue\nwed\nthu\nfri\nsat\nsun```");
    }

    //If scores need to be added or changed
    else if (tableName == "score") {
      if (msg.author.id != 102212539609280512) { //Id of the user who can use this

      }
      else {
        var score = "";
        var i = tableName.length + command.length + 2;
        while (checkInt) {
          if (isNumeric(input.charAt(i)) == true) {
            score += input.charAt(i);
            i++;
          }
          else {
            checkInt = false
          }
        }
        score = parseInt(score);

        var target = "";

        if (command != "show") {
          target = msg.mentions.users.first();
          if (target) console.log(target);

          var displayName = "";

          if (target.nickname != null) {
            displayName = target.nickname;
          }
          else {
            displayName = target.username;
          }
        }

        //Will add or update the score on a particular user
        if (command == "add") {
          connection.query(`SELECT * FROM ${tableName} WHERE id = '${target.id}'`, (err, rows) => {
            if (err) throw err;

            let sql;
              if (rows.length < 1) { //Check if the user already has a score
                sql = `INSERT INTO ${tableName} (id, name, score) VALUES ('${target.id}', '${displayName}', ${score})`;
                msg.author.send("You added **" + displayName + "** to the scoreboard");
                console.log("User " + target.id + " added");

                connection.query(sql);
              }
              else { //Will update the current score for the user
                var preScore = 0;
                connection.query(`SELECT * FROM ${tableName} WHERE id = '${target.id}'`, (err, rows) => {
                  if (err) throw err;

                  preScore = rows[0].score;

                  var scoreTotal = preScore + score;

                  sql = `UPDATE discorddatabase . ${tableName} SET name = '${displayName}', score = ${scoreTotal} WHERE id = '${target.id}'`;
                  msg.author.send("You updated **" + displayName + "** in the scoreboard");
                  console.log("User " + target.id + " updated");

                  connection.query(sql);
                });
              }
          });
        }

        //Will remove the entry of that user
        else if (command == "remove") {
          connection.query(`SELECT * FROM ${tableName} WHERE id = '${target.id}'`, (err, rows) => {
            if (err) throw err;

            else {
              sql = `DELETE FROM discorddatabase . ${tableName} WHERE id = '${target.id}'`;
              msg.author.send("You removed **" + displayName + "** from the scoreboard");
              console.log("User " + msg.author.id + " removed");
              connection.query(sql);
            }
          });
        }

        //Will show the current leaderboard
        else if (command == "show") {
          connection.query(`SELECT name, score FROM ${tableName} ORDER BY score DESC`, async (err, rows) => { //Get all users with a score sorted by order
            if (err) throw err;

            else {
              var message = ""; //Print message
              for (var i = 0; i < rows.length; i++) { //Thjis will heppen for each user
                var name = rows[i].name;
                var score = rows[i].score;

                if (!isEven(i) && i != 0) { //Check to se if a devider is needed
                  message += "----------------------------------\n";
                }

                message += name;
                for (var j = 0; j < 30-name.length; j++) { //Just so score number will be on the same place for everyone. This will break if the username has a name longer then 30 characters or non UTF-8 characters
                  message += " ";
                }
                message += score + "\n"; //row break
              }

              //Creat picture for the bot to print
              const canvas = Canvas.createCanvas(420, (30*rows.length)+14);
              const ctx = canvas.getContext('2d');

              var rand = Math.floor(Math.random() * Math.floor(1520));
              if (rand != 0) {
                rand = rand * -1;
              }

              const background = await Canvas.loadImage('./discordBG.png');
              ctx.drawImage(background, rand, 0, 1920, 1080);

              ctx.fillStyle = '#ffffff';
              ctx.font = '15px monoMMM_5';
              ctx.fillText(message, 45, 25); //Message added here



              const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

              msg.channel.send(attachment); //Print picture
            }
          });
        }
      }
    }

    else {
      //Check for time. This is needed becasue of am/pm
      if (command == "add" || command == "update" || command == "event") {
        if (command == "event") {
          var k = tableName.length + command.length + followUp.length + 3;
        }
        else {
          var k = tableName.length + command.length + 2;
        }
        while (checkInt) {
          if (isNumeric(input.charAt(k)) == true) {
            start += input.charAt(k);
            k++;
          }
          else {
            if (input.charAt(k) == 'p' || input.charAt(k) == 'a' && input.charAt(k + 1) == 'm') {
              startTime = input.charAt(k) + input.charAt(k + 1);
              k += 3;
              while (checkInt) {
                if (isNumeric(input.charAt(k)) == true) {
                  end += input.charAt(k);
                  k++;
                }
                else {
                  endTime = input.charAt(k) + input.charAt(k + 1);
                  checkInt = false;
                }
              }
            }
            else if (input.charAt(k) == '-') {
              time24 = true;
              k += 1;
              while (checkInt) {
                if (isNumeric(input.charAt(k)) == true) {
                  end += input.charAt(k);
                  k++;
                }
                else {
                  checkInt = false;
                }
              }
            }
            else {
              checkInt = false;
            }
          }
        }
        start = parseInt(start);
        end = parseInt(end);
      }

      if (tableName == "event") {} //This can probably be moved but as everything works I decided just not to

      else {
        //Will add a user to a day with a time for where they can take part in events
        if (command == "add") {
          connection.query(`SELECT * FROM ${tableName} WHERE id = '${msg.author.id}'`, (err, rows) => {
            if (err) throw err;

            let sql;
            if (startTime != "pm" && startTime != "am" && endTime != "pm" && endTime != "am" && time24 == false) {
              msg.channel.send("Wrong format! For help use command **!help**");
            }
            else {
              if (rows.length < 1) {
                var sortTime = start;
                if (startTime == "pm") {
                  sortTime += 12;
                }
                sql = `INSERT INTO ${tableName} (id, name, start, end, startTime, endTime, sortTime) VALUES ('${msg.author.id}', '${msg.member.displayName}', ${start}, ${end}, '${startTime}', '${endTime}', '${sortTime}')`;
                msg.author.send("Your entry has been added with the time: " + start + startTime + "-" + end + endTime);
                console.log("User " + msg.author.id + " added");
              }
              else { //If the usr already has a time it will be updated (safety measure)
                var sortTime = start;
                if (startTime == "pm") {
                  sortTime += 12;
                }
                sql = `UPDATE discorddatabase . ${tableName} SET name = '${msg.member.displayName}', start = ${start}, end = ${end}, startTime = '${startTime}', endTime = '${endTime}', sortTime = '${sortTime}' WHERE id = '${msg.author.id}'`;
                msg.author.send("You already had an entry so I updated it for you with the time: " + start + startTime + "-" + end + endTime);
                console.log("User " + msg.author.id + " updated");
              }
              connection.query(sql);
            }
          });
        }

        //Will remove the usr from a day
        else if (command == "remove") {
          connection.query(`SELECT * FROM ${tableName} WHERE id = '${msg.author.id}'`, (err, rows) => {
            if (err) throw err;

            else {
              sql = `DELETE FROM discorddatabase . ${tableName} WHERE id = '${msg.author.id}'`;
              msg.author.send("Your entry has been removed");
              console.log("User " + msg.author.id + " removed");
              connection.query(sql);
            }
          });
        }

        //Will updat the users time for that day
        else if (command == "update") {
          connection.query(`SELECT * FROM ${tableName} WHERE id = '${msg.author.id}'`, (err, rows) => {
            if (err) throw err;

            let sql;
            if (startTime != "pm" && startTime != "am" && endTime != "pm" && endTime != "am" && time24 == false) {
              msg.channel.send("Wrong format! For help use command **!help**")
            }
            else {
              var sortTime = start;
              if (startTime == "pm") {
                sortTime += 12;
              }
              sql = `UPDATE discorddatabase . ${tableName} SET name = '${msg.member.displayName}', start = ${start}, end = ${end}, startTime = '${startTime}', endTime = '${endTime}', sortTime = '${sortTime}' WHERE id = '${msg.author.id}'`;
              msg.author.send("Your entry was updated with the time: " + start + startTime + "-" + end + endTime);
              console.log("User " + msg.author.id + " updated");
              connection.query(sql);
            }
          });
        }

        //Will show each user with a time for that day
        else if (command == "show") {
          if (input.length > 14) {
            msg.channel.send("Please use the correct format");
          }
          else {
            //Will get if the user is using am/pm time or not
            var msgID;
            connection.query(`SELECT startTime FROM ${tableName} WHERE id = '${msg.author.id}'`, async (err, test) => {
              if (err) throw err;
              msgID = test[0].startTime;
            });

            connection.query(`SELECT * FROM ${tableName} ORDER BY sortTime`, async (err, rows) => { //Get every user with a time on that day
              if (err) throw err;

              if (rows < 1) {
                msg.channel.send("No entries here")
              }
              else {
                var count = 0;

                const amPm  = '01 02 03 04 05 06 07 08 09 10 11 12 01 02 03 04 05 06 07 08 09 10 11 12 -----> 01 02 03 04 05 06 07 08 09 10 11 12';
                const h24   = '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 00 -----> 01 02 03 04 05 06 07 08 09 10 11 12';

                //If the user want to display a specific time format
                var showTime = "";
                if (input.length > 9 && input.length < 15) {
                  for (var i = 9; i < input.length; i++) {
                    showTime += input.charAt(i);
                  }
                }

                if (showTime == "am/pm") {
                  message = tableName + "\t\t\t---------------AM------------------|---------------PM------------------        ---------------AM------------------\n\t\t\t" + amPm + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                }
                else if (showTime == "24h") {
                  message = tableName + "\t\t\t-------------Morning---------------|-------------Evening---------------        -------------Morning---------------\n\t\t\t" + h24 + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                }
                else {
                  if (msgID == "am" || msgID == "pm") {
                    message = tableName + "\t\t\t---------------AM------------------|---------------PM------------------        ---------------AM------------------\n\t\t\t" + amPm + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                  }
                  else {
                    message = tableName + "\t\t\t-------------Morning---------------|-------------Evening---------------        -------------Morning---------------\n\t\t\t" + h24 + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                  }
                }

                for (var i = 0; i < rows.length; i++) { //Get all users with a time
                  let name = rows[i].name;
                  message += name;

                  let printStart = rows[i].start;
                  let printEnd = rows[i].end;

                  let startZone = rows[i].startTime;
                  let endZone = rows[i].endTime;

                  if (startZone == "pm") {
                    printStart += 12;
                  }
                  if (endZone == "pm") {
                    printEnd += 12;
                  }

                  //Because of different length on names this will fix that problem
                  var x = name.length - 7;
                  var y = 0;
                  if (x < 0) {
                    y = x * -1;
                    x = 0;
                  }

                  if (startZone = "pm") {
                    space = (((printStart - 12) * 2) + ((printStart - 12) - 1) + 51) - x + y;
                  }
                  else {
                    space = ((printStart * 2) + (printStart - 1) + 12) - x + y;
                  }
                  for (var j = 0; j < space; j++) {
                    message += " ";
                  }
                  while (printStart != printEnd) {
                    message += "XX ";
                    printStart++;
                    if (printStart > 24) {
                      message += "       ";
                      printStart = 1;
                    }
                  }
                  message += "XX\n";
                  if (isEven(count)) {
                    message += "------------------------------------------------------------------------------------------------------------------------------------------\n";
                  }
                  count++;
                }

                 const canvas = Canvas.createCanvas(1200, 600);
                 const ctx = canvas.getContext('2d');

                 const background = await Canvas.loadImage('./discordBG.png');
                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                 ctx.fillStyle = '#ffffff';
                 ctx.font = '12px monoMMM_5';
                 ctx.fillText(message, 45, 25);



                 const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

                 msg.channel.send(attachment); //Print picture
              }
            });
          }
        }

        //Add events
        else if (command == "event") {
          if (followUp == "add") { //Add events with a day and time
            connection.query(`SELECT * FROM ${command} WHERE day = '${tableName}'`, (err, rows) => {
              if (err) throw err;

              let sql;
                if (rows.length < 1) {
                  sql = `INSERT INTO ${command} (day, start, end, startTime, endTime) VALUES ('${tableName}', '${start}', ${end}, '${startTime}', '${endTime}')`;
                  msg.author.send("You have created an event on: **" + tableName + ": " + start + startTime + "-" + end + endTime + "**");
                  console.log("User " + msg.author.id + " created an event on: " + tableName);
                }
                else {
                  sql = `UPDATE discorddatabase . ${command} SET start = ${start}, end = ${end}, startTime = '${startTime}', endTime = '${endTime}' WHERE day = '${tableName}'`;
                  msg.author.send("You have created an event on: **" + tableName + ": " + start + startTime + "-" + end + endTime + "**");
                  console.log("User " + msg.author.id + " updated an event on: " + tableName);
                }
                connection.query(sql);
            });
            connection.query(`SELECT * FROM ${tableName}`, (err, rows) => {
              if (rows.length < 1) {
                msg.channel.send("No users have that time");
              }
              else {
                var text = "";

                if (startTime == "pm" && endTime == "am" || startTime == "am" && endTime == "am") {
                  end += 24;
                }
                else if (startTime != "pm" && startTime != "am" && start > end) {
                  end += 24;
                }
                else if (endTime == "pm") {
                  end += 12;
                }

                if (startTime == "pm") {
                  start += 12;
                }

                for (var i = 0; i < rows.length; i++) {
                  let userID = rows[i].id;

                  let userStart = rows[i].start;
                  let userEnd = rows[i].end;

                  let startZone = rows[i].startTime;
                  let endZone = rows[i].endTime;

                  if (startZone == "pm") {
                    userStart += 12;
                  }
                  if (endZone == "pm") {
                    userEnd += 12;
                  }

                  if (startZone == "pm" && endZone == "am" || startZone == "am" && endZone == "am") {
                    userEnd += 24;
                  }
                  else if (startZone != "pm" && startZone != "am" && userStart > userEnd) {
                    userEnd += 24;
                  }
                  if (userStart >= start && userStart <= end || userEnd >= start && userEnd <= end) {
                    text += "<@" + userID + ">\n";
                  }
                }
                msg.channel.send("An event has been created with the day and time: **" + tableName + ": " + start + startTime + "-" + end + endTime + "**\n\nThese are the people who might participate in the event:\n" + text);
              }
            });
          }

          //Update the event if you somehow typed wrong
          if (followUp == "update") {
            connection.query(`SELECT * FROM ${command} WHERE day = '${tableName}'`, (err, rows) => {
              if (err) throw err;

              let sql;
                if (rows.length < 1) {
                  msg.channel.send("No event to be updated")
                }
                else {
                  sql = `UPDATE discorddatabase . ${command} SET start = ${start}, end = ${end}, startTime = '${startTime}', endTime = '${endTime}' WHERE day = '${tableName}'`;
                  msg.author.send("You have updated an event on: **" + tableName + "** New time is**: " + start + startTime + "-" + end + endTime + "**");
                  console.log("User " + msg.author.id + " updated an event on: " + tableName);
                }
                connection.query(sql);
            });
          }

          //Remove event if you decide not to have it anymore
          if (followUp == "remove") {
            connection.query(`SELECT * FROM ${command} WHERE day = '${tableName}'`, (err, rows) => {
              if (err) throw err;

              else {
                sql = `DELETE FROM discorddatabase . event WHERE day = '${tableName}'`;
                msg.channel.send("The event on: **" + tableName + "** has been removed");
                console.log("User " + msg.author.id + " removed an event on: " + tableName);
                connection.query(sql);
              }
            });
          }

          //Show all events currently created. Same as normal show command
          if (tableName == "show") {
            connection.query(`SELECT * FROM ${command}`, async (err, rows) => {
              if (err) throw err;

              if (rows < 1) {
                msg.channel.send("No entries here")
              }
              else {
                var count = 0;

                const amPm  = '01 02 03 04 05 06 07 08 09 10 11 12 01 02 03 04 05 06 07 08 09 10 11 12 -----> 01 02 03 04 05 06 07 08 09 10 11 12';
                const h24   = '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 00 -----> 01 02 03 04 05 06 07 08 09 10 11 12';

                var showTime = "";
                if (input.length > 10 && input.length < 17) {
                  for (var i = 11; i < input.length; i++) {
                    showTime += input.charAt(i);
                  }
                }
                if (showTime == "am/pm") {
                  var message = "\t\t\t---------------AM------------------|---------------PM------------------        ---------------AM------------------\n\t\t\t" + amPm + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                }
                else if (showTime == "24h") {
                  var message = "\t\t\t-------------Morning---------------|-------------Evening---------------        -------------Morning---------------\n\t\t\t" + h24 + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                }
                else {
                  var message = "\t\t\t-------------Morning---------------|-------------Evening---------------        -------------Morning---------------\n\t\t\t" + h24 + "\n\t\t\t------------------------------------------------------------------------------------------------------------------\n";
                }

                for (var i = 0; i < rows.length; i++) {
                  let day = rows[i].day;
                  message += day;

                  let printStart = rows[i].start;
                  let printEnd = rows[i].end;

                  let startZone = rows[i].startTime;
                  let endZone = rows[i].endTime;

                  if (startZone == "pm") {
                    printStart += 12;
                  }
                  if (endZone == "pm") {
                    printEnd += 12;
                  }

                  var x = day.length - 7;
                  var y = 0;
                  if (x < 0) {
                    y = x * -1;
                    x = 0;
                  }

                  if (startZone = "pm") {
                    space = (((printStart - 12) * 2) + ((printStart - 12) - 1) + 51) - x + y;
                  }
                  else {
                    space = ((printStart * 2) + (printStart - 1) + 12) - x + y;
                  }
                  for (var j = 0; j < space; j++) {
                    message += " ";
                  }
                  while (printStart != printEnd) {
                    message += "XX ";
                    printStart++;
                    if (printStart > 24) {
                      message += "       ";
                      printStart = 1;
                    }
                  }
                  message += "XX\n";
                  if (isEven(count)) {
                    message += "------------------------------------------------------------------------------------------------------------------------------------------\n";
                  }
                  count++;
                }

                 const canvas = Canvas.createCanvas(1200, 600);
                 const ctx = canvas.getContext('2d');

                 const background = await Canvas.loadImage('./discordBG.png');
                 ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                 ctx.fillStyle = '#ffffff';
                 ctx.font = '12px monoMMM_5';
                 ctx.fillText(message, 45, 25);



                 const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

                 msg.channel.send(attachment);

              }
            });
          }
        }
      }
    }
  }

});


bot.login(token);
