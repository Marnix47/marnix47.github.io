class Password{
    constructor(input, index){
        this.index = index + 1;
        this.password = input;
        // this.hash = generateHash(input);
        generateHash(input).then(x => this.hash = new TextDecoder("utf-8").decode(x));
    }
}