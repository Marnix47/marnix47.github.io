export class IdGenerator {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.initialized = this.state.storage.get("counter")
  }

  async fetch(request) {
    let counter = await this.initialized

    if (counter === undefined) {
      counter = 1
    } else {
      counter += 1
    }

    await this.state.storage.put("counter", counter)

    return new Response(counter.toString())
  }
}