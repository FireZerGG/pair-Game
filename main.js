(() => {

  let container = document.getElementById("container");

  const createTag = (tagName, className, appendTo, text) => {
    let tag = document.createElement(tagName)
    tag.classList.add(className)
    appendTo.append(tag)
    if (text) { 
      tag.innerHTML = text
    }
    return tag
  }

  function menuScreen() {
    return new Promise((resolve) => {

      let menuTitle = createTag('h2', 'menu__title', container, 'Меню')
      let menuInputText = createTag('div', 'menu__input_text', container, 'Количество карт:')
      let menuInput = createTag('input', 'menu__input', container)
      menuInput.setAttribute("type", "number")
      menuInput.setAttribute('value', '16')
      let menuStartBtn = createTag('button', 'btn', container, 'Играть')

      let cardArr = []

      const endFunction = () => {
        let cardCount = menuInput.value

        if (cardCount < 2) cardCount = 2
        if (cardCount > 100) cardCount = 100

        for (let count = 0; count < Math.floor(cardCount / 2); count++) {
          cardArr.push(count)
          cardArr.push(count)
        }

        container.removeChild(menuTitle)
        container.removeChild(menuInputText)
        container.removeChild(menuInput)
        container.removeChild(menuStartBtn)

        resolve(cardArr)
      }

      menuInput.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) {
          endFunction()
        }
      })

      menuStartBtn.onclick = () => {
        endFunction()
      };
    });
  }

  function game(cardArr) {

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    function createField(arr) {
      let cardsList = document.createElement("ul")
      let idCount = 0

      for (i of shuffle(arr)) {
        let card = document.createElement("li")

        if (arr.length <= 16) {
            card.classList.add("card_1");
        } else if (arr.length > 16 && arr.length <=36) {
            card.classList.add("card_2");
        } else if (arr.length > 36) {
            card.classList.add("card_3");
        }

        let cardInner = createTag('div', 'card_inner', card)
        let cardFront = createTag('div', 'card_front', cardInner, i+'')
        let cardBack = createTag('div', 'card_back', cardInner, i+'')

        cardsList.append(card)
        // card.innerHTML = i
        cardFront.id = idCount
        cardBack.id = idCount
        idCount++
      }

      return cardsList;
    }

    function solvedCheck(cardsList) {
      let count = 0
      for (card of cardsList.children) {
        if (card.children[0].children[0].classList.contains("solved")) {
          count++
        }
      }

      return count
    }

    let header = createTag('div', 'game_header', container)
    let fieldContainer = createTag('div', 'field_container', container)
    let errors = createTag('div', 'game_errors', header, 'Ошибок: 0')
    let timer = createTag('div', 'game_menu_timer', header, '0:0')
    let quitBtn = createTag('button', 'game_quitBtn', header, 'Выйти')

    let seconds = 0
    let minutes = 0
    let timerInterval = setInterval(() => {
      seconds++
      if (seconds === 60) {
        minutes++
        seconds = 0
      }
      timer.innerHTML = `${minutes}:${seconds}`
    }, 1000)

    let field = createField(cardArr)
    fieldContainer.append(field)

    let errorsCount = 0

    return new Promise((resolve) => {

      quitBtn.onclick = () => {
        container.removeChild(fieldContainer)
        container.removeChild(header)
        clearInterval(timerInterval)
        resolve(['loose', minutes, seconds])
      }

      let clickedCardsArr = []
      let clickedCardCount

      field.onclick = (event) => {

        let card = event.target

        if (card === field || card.parentNode.children[0].classList.contains('solved')) {
          return
        }

        card.parentNode.parentNode.classList.toggle('is_flipped')

        card.parentNode.parentNode.classList.toggle('scaled')
        setTimeout(() => {
          card.parentNode.parentNode.classList.toggle('scaled')
        },150)
        
        card.classList.add("clicked")

        clickedCardsArr.push(card)

        setTimeout(() => {
          if (clickedCardsArr.length > 1) {
                if (clickedCardsArr[0].id === clickedCardsArr[1].id) {
                  document.getElementById(clickedCardsArr[0].id).classList.remove("clicked")
                  errorsCount++
                }

                if (!(clickedCardsArr[0].innerHTML === clickedCardsArr[1].innerHTML)) {
                  document.getElementById(clickedCardsArr[0].id).classList.remove("clicked")
                  document.getElementById(clickedCardsArr[1].id).classList.remove("clicked")
                  document.getElementById(clickedCardsArr[0].id).parentNode.parentNode.classList.toggle('is_flipped')
                  document.getElementById(clickedCardsArr[1].id).parentNode.parentNode.classList.toggle('is_flipped')
                  errorsCount++
                } else if (!(clickedCardsArr[0].id === clickedCardsArr[1].id)){
                    document.getElementById(clickedCardsArr[0].id).classList.add("solved")
                    document.getElementById(clickedCardsArr[1].id).classList.add("solved")
                    document.getElementById(clickedCardsArr[0].id).parentNode.children[1].classList.add("solved")
                    document.getElementById(clickedCardsArr[1].id).parentNode.children[1].classList.add("solved")
                    document.getElementById(clickedCardsArr[0].id).classList.remove("clicked")
                    document.getElementById(clickedCardsArr[1].id).classList.remove("clicked")
                }

            clickedCardsArr = []
          }

          clickedCardCount = solvedCheck(field);

          errors.innerHTML = `Ошибок: ${errorsCount}`

          if (clickedCardCount === cardArr.length) {
            container.removeChild(fieldContainer)
            container.removeChild(header)
            clearInterval(timerInterval)
            resolve(['win', minutes, seconds])
          }
        }, 350)
      };
    });
  }

  function endScreen(res) {

    let minutes = res[1]
    let seconds = res[2]

    return new Promise((resolve) => {

      let message = createTag('div', 'win_message', container)
      let endgameTime = createTag('div', 'endgame_time', container, `Итоговое время: ${minutes}:${seconds}`)
      let restartBtn = createTag('button', 'btn', container, 'Выход в меню')
      
      res[0] === 'win' ? message.innerHTML = "Вы победили!" : message.innerHTML = "Вы проиграли :("

      restartBtn.onclick = () => {
        container.removeChild(message)
        container.removeChild(restartBtn)
        container.removeChild(endgameTime)
        resolve()
      }
    })
  }

  async function run() {
    while (true) {
      let arr = await menuScreen()

      let res = await game(arr)

      await endScreen(res)
    }
  }

  document.addEventListener("DOMContentLoaded", run )

})();