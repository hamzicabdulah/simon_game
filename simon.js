$(document).ready(function () {

  //Play "Simon Says" song by Pharoahe Monch on page load
  Howler.mobileAutoEnable = false;
  var simonSaysSong = new Howl({
    src: ['http://czechmyjugs.com/Simon%20Says.mp3'],
    preload: true,
    loop: true
  });
  function playSong () {
    /*if (sound === 'on') {
      simonSaysSong.play();
    }*/
  }

  //Toggle audio on and off
  if ($(window).width() > 768) {
    var sound = 'on';
  } else {
    var sound = 'off';
    $('.material-icons').html('&#xE04F;');
  }
  $('.material-icons').on('click', function () {
    if (sound === 'off') {
      $(this).html('&#xE050;');
      sound = 'on';
      if (!$(".start").is(":disabled")) {
        playSong();
      }
    } else {
      $(this).html('&#xE04F;');
      sound = 'off';
      simonSaysSong.pause();
    }
  });

  $('.reset').prop('disabled', true);
  playSong();

  var buttonSeries = [], playerMoves = [], currentIndex = 0, turn = 'computer', strict = false,
      randNum, btnsDisabled = false, points = 0, correctGuess = true,
      buttons = ['green', 'red', 'yellow', 'blue'], buttonSounds = {}, resetted = true;

  //Add sound effects
  buttons.forEach(function (button, index) {
    buttonSounds[button] = new Howl({
      src: [('https://s3.amazonaws.com/freecodecamp/simonSound' + (index + 1) + '.mp3')],
      buffer: true,
      preload: true
    });
  });

  var error = new Howl({
    src: [('http://k003.kiwi6.com/hotlink/clrtgq79wz/failsimon.mp3')],
    buffer: true,
    volume: 0.5,
    preload: true
  });

  function toggleStrict() {
  //Turn strict mode off and on
    if (!strict) {
      strict = true;
      $('.strict').css('background-color', '#ff6633');
    } else {
      strict = false;
      $('.strict').css('background-color', '#5c8a8a');
    }
  }

  $('.strict').on('click', toggleStrict);

  var spinning = false, spin;

  function toggleSpin () {
    if (!spinning) {
      spinning = true;
	    $('.spin').css('background-color', '#ff6633');
  	} else {
      spinning = false;
	    $('.spin').css('background-color', '#5c8a8a');
	  }
  }

  $('.spin').on('click', toggleSpin);

  var btnTurnOffSpeed = 600, nextBtnDelay = 900;

  function turnBtnOn (btn) {
  //Illuminate (change the color of) the button that's given as an argument
    $('.' + btn).addClass(btn + 'On');
    btnsDisabled = true;
    if (sound === 'on') {
      buttonSounds[btn].play();
    }
    setTimeout(function () {
      $('.' + btn).removeClass(btn + 'On');
      btnsDisabled = false;
    }, btnTurnOffSpeed);
  }

  var i, howManyTimes;

  function playSeries () {
  //Play the series of buttons that the player needs to repeat
    if (!resetted) {
      if (i === 0 && correctGuess) {
        points++;
        $('.score').text(points);
      }
      if (points < 11) {
        nextBtnDelay = 900;
        btnTurnOffSpeed = 600;
      } else if (points === 11) {
        nextBtnDelay = 700;
        btnTurnOffSpeed = 400;
      }
      turnBtnOn(buttonSeries[i]);
      i++;
      if (i < howManyTimes) {
        turn = 'computer';
        setTimeout(playSeries, nextBtnDelay);
      } else if (i === howManyTimes && (points > 0 || howManyTimes > 0)) {
        setTimeout(function () {
          turn = 'player';
        }, nextBtnDelay);
      }
    }
  }

  function turnRandBtn () {
  //Add a new button to the series and play the series again
    randNum = Math.floor(Math.random() * 4);
    buttonSeries.push(buttons[randNum]);
    i = 0, howManyTimes = buttonSeries.length;
    playSeries();
  }

  function startGame () {
  //Start game — enable reset button and disable the rest of the buttons
    resetted = false;
    simonSaysSong.stop();
    correctGuess = true;
    if (spinning) {
      $('.mainDiv').addClass('spinningMainDiv');
      $('.innerCircle').addClass('spinningInner');
    }
    turnRandBtn();
    $('.start').prop('disabled', true);
    $('.strict').prop('disabled', true);
    $('.spin').prop('disabled', true);
    $('.reset').prop('disabled', false);
  }

  $('.start').on('click', startGame);

  function reset () {
  //Reset score to zero and end the game
    resetted = true;
    buttonSeries = [];
    playerMoves = [];
    btnTurnOffSpeed = 600;
    nextBtnDelay = 900;
    turn = 'computer';
    setTimeout(function () {
        $('.start').prop('disabled', false);
    }, 1300);
    $('.strict').prop('disabled', false);
    $('.spin').prop('disabled', false);
    points = 0;
    $('.score').text(points);
    howManyTimes = 0;
    if (spinning) {
      setTimeout(function () {
        $('.mainDiv').removeClass('spinningMainDiv');
        $('.innerCircle').removeClass('spinningInner');
      }, 200);
    }
    setTimeout(function(){
      buttonSeries = [];
    }, 1300);
    $('.reset').prop('disabled', true);
  }

  $('.reset').on('click', function() {
    reset();
    $('.score').text(points);
    playSong();
  });

  $('.colorBtn').hover(function () {
    if (turn === 'player' && points > 0) {
      $(this).css('cursor', 'pointer');
    } else {
      $(this).css('cursor', 'default');
    }
  });

  function buttonClick (button) {
  //Illuminate the button clicked by the player and decide whether it's a correct guess — if it is not, reset the game
    if (!btnsDisabled && turn === 'player') {
      nextBtnDelay = 500;
      btnTurnOffSpeed = 220;
      turnBtnOn(button);
      playerMoves.push(button);
      playerMoves.forEach(function (button, index) {
        if (button !== buttonSeries[index]) {
          $('.score').text('! !');
          if (sound === 'on') {
            error.play();
          }
          if (strict) {
            reset();
            setTimeout(function () {
              $('.score').text(points);
            }, 1200);
            setTimeout(startGame, 1500);
          } else {
            setTimeout(function () {
              $('.score').text(points);
            }, 1200);
            playerMoves = [];
            turn = 'computer';
            i = 0;
            correctGuess = false;
            setTimeout(playSeries, 1500);
          }
        } else if (index === buttonSeries.length-1) {
          playerMoves = [];
          turn = 'computer';
          correctGuess = true;
          if (points === 20) {
            $('.score').text('* *');
            playSong();
            setTimeout(reset, 1500);
          } else {
            setTimeout(turnRandBtn, 1500);
          }
        }
      });
    }
  }

  function handleClick (className) {
    $('.' + className).on('click', function () {
      buttonClick(className);
    });
  }

  for (var j = 0; j < buttons.length; j++) {
    $('.' + buttons[j]).on('click', handleClick(buttons[j]));
  }

});
