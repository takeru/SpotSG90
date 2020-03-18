/* global trace */
import { Application, Style, Skin, Label } from 'piu/MC'
import Dog from "dog";

const FONT = 'OpenSans-Regular-52'

const application = new Application(null, {
  contents: [
    new Label(null, {
      style: new Style({ font: FONT, color: 'white' }),
      skin: new Skin({ fill: 'black' }),
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      string: '0'
    })
  ]
})

const counts = {
  a: 0
}

function countup (button) {
  counts[button] += 1
  trace(counts[button] + "\n")
  application.first.string = String(counts[button])
}

global.button.a.onChanged = function () {
  const v = this.read()
  if (v) {
    countup('a')
  }
}

const dog = new Dog();
