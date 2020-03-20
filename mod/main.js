/* global trace */
import { Application, Style, Skin, Label } from 'piu/MC'
import Dog from "dog";
import WSServer from "ws_server";
import Time from "time";

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
const server = new WSServer((cmd, request) => {
  let response = null;

  if (cmd.startsWith("dog.")) {
    trace(`WS: cmd=${cmd} request=${JSON.stringify(request)}\n`);
    response = dog.cmd(cmd, request);
    trace(`response=${JSON.stringify(response)}\n`);
  } else if (cmd == "ping") {
    response = {
      "seq": request.seq,
      "ms": request.ms
    }
  } else if (cmd == "hello") {
    trace(`**** hello ****\n`);
    response = {
      "now": Date.now(),
      "ticks": Time.ticks
    }
  }
  return response;
});
