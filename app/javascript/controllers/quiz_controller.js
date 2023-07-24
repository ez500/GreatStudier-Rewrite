import { Controller } from "@hotwired/stimulus"
import * as util from "../util"

// Connects to data-controller="quiz"
export default class extends Controller {
  static values = {
    cards: Array,
    id: String
  }

  static targets = ["label", "term", "guess", "button", "correctness"]

  correct = 0
  incorrect = 0

  connect() {
    this.random_cards = (window.location.pathname === "/s/" + this.idValue + "/review") ? util.shuffle(util.get_studyable(this.cardsValue, this.idValue)[1]) : util.shuffle(this.cardsValue)
    if (this.random_cards.length === 0) {
      this.end()
      return
    }
    this.current_index = 0
    this.current_card = this.random_cards[this.current_index]
    this.print_card()
  }

  print_card() {
    this.termTarget.textContent = this.current_card.term
    this.update_label()
    this.reset_fields()
    const input = document.getElementById('input');
    input.focus();
    input.select();
  }

  async check(event) {
    switch (util.validate_answer(this.guessTarget.value, this.current_card.definition)) {
      case 0:
        this.correctnessTarget.textContent = "Correct!";
        if (window.location.pathname === "/s/" + this.idValue + "/review") {
          util.increment_knowledge(this.current_card, this.idValue)
        }
        this.correct += 1;
        break;
      case 1:
        this.correctnessTarget.textContent = "Mostly Correct!";
        this.correctnessTarget.textContent += ` The correct answer is "${this.current_card.definition}"`;
        if (window.location.pathname === "/s/" + this.idValue + "/review") {
          util.increment_knowledge(this.current_card, this.idValue, false)
        }
        this.correct += 1;
        break;
      case 2:
        this.correctnessTarget.textContent = "Incorrect!";
        this.correctnessTarget.textContent += ` The correct answer is "${this.current_card.definition}"`;
        if (window.location.pathname === "/s/" + this.idValue + "/review") {
          util.increment_knowledge(this.current_card, this.idValue, false)
        }
        this.incorrect += 1;
        break;
    }
    this.buttonTarget.disabled = true
    this.guessTarget.disabled = true
    this.update_label()
    await new Promise(r => setTimeout(r, 1000));
    this.next_card()
  }

  next_card() {
    if (this.current_index + 1 === this.random_cards.length) {
      this.end()
      return
    }
    this.current_index += 1
    this.current_card = this.random_cards[this.current_index]
    this.print_card()
  }

  update_label() {
    this.labelTarget.textContent = `Question ${this.current_index + 1}/${this.random_cards.length} Correct: ${this.correct}, Incorrect: ${this.incorrect}`
  }

  reset_fields() {
    this.guessTarget.value = ""
    this.correctnessTarget.textContent = ""
    this.buttonTarget.disabled = false
    this.guessTarget.disabled = false
  }

  end() {
    if (window.location.pathname === "/s/" + this.idValue + "/review") {
      this.labelTarget.textContent = `Nothing to review!`
    } else {
      this.labelTarget.textContent = "Finished study!"
    }
    if (this.correct + this.incorrect === 0) {
      this.termTarget.style.display = "none"
    } else {
      this.termTarget.textContent = `Correct: ${this.correct}, Incorrect: ${this.incorrect}`
    }
    this.guessTarget.style.display = "none"
    this.buttonTarget.style.display = "none"
    if (window.location.pathname === "/s/" + this.idValue + "/review") {
      this.times = util.get_time_to_next_studyable(this.cardsValue, this.idValue)
      if (this.times === null) {
        this.correctnessTarget.textContent = "You have new words to learn before reviewing!"
      } else if (this.times[0] + this.times[1] + this.times[2] <= 0) {
        this.correctnessTarget.textContent = "You can review again!"
      } else {
        this.correctnessTarget.textContent = "Come back for your next review in " + this.times[0] + " hours, " + this.times[1] + " minutes, and " + this.times[2] + " seconds."
      }
    } else {
      this.correctnessTarget.style.display = "none"
    }
  }
}
