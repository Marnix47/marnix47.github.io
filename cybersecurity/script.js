var inputField;
var validPasswordField;
var hashField;

window.onload = function(){
    // var processedPasswords = getProcessedPasswords();
    // processedPasswords.forEach((x,i) => passwords.push(new Password(x,i)));
    console.log(passwords);
    loadPasswords();

    inputField = document.getElementById("passwordInput");
    validPasswordField = document.getElementById("validPassword");
    hashField = document.getElementById("outputHash");
    inputField.addEventListener("keyup", event => {
        generateHash(event.target.value.trim()).then(result => {
            // console.warn(event.target.value.trim());
            // console.log(event.target.value.trim() === passwords[0].password)
            // console.log(passwords[0].hash);
            // generateHash(passwords[0].password).then(x => console.log(new TextDecoder("utf-8").decode(x)))
            runUpdateFromHash(new TextDecoder("utf-8").decode(result), result)
            console.log(Array.from(new Uint16Array(result)).map(x => x.toString(16)));
            let a = Array.from(result)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
            console.log(a);
            // console.log(new TextDecoder("utf-8"))
            // runUpdateFromHash(result)

        });
    })
}

async function loadPasswords(){
    const response = await fetch("https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/10-million-password-list-top-100000.txt")
    // .then(result => {
    //     console.log();
    // })
    const unpacked = await response.text();
    // console.log(unpacked);
    let a = unpacked.split("\n");
    // console.log(a);
    a.forEach((x,i) => {
        passwords.push(new Password(x, i));
    })
    // console.log(unpacked);

}

function runUpdateFromHash(input, rawHashBuffer){
    var hashed0;
    generateHash(passwords[0].password).then(x => hashed0 = new TextDecoder().decode(x));
    // console.log(new TextDecoder().decode(new TextEncoder().encode(input)) == new TextDecoder().decode(new TextEncoder().encode(hashed0)));
    // console.log("running", this);
    // console.log(input);
    let f = () => {let a = []; input.forEach(x => a.push(x)); return a}
    // console.log(input.split(""));
    // console.log(passwords[0].hash.split(""))
    // console.log(arraysEqual(input.split(""),passwords[0].hash.split("")));
    // eval(`console.log("${hashed0}" == "${input}");`);
    // console.lo
    // hashField.innerText = generateHash(input);
    console.log(new TextEncoder().encode(input))
    let inputHex = Array.from(new TextEncoder().encode(input))
        // .map(b => b.toString(10))
        // .join('')
        // .toUpperCase();
    // inputHex = JSON.stringify(Array.from(new TextEncoder().encode(input)));
    inputHex = Array.from(new Uint16Array(rawHashBuffer)).map(x => x.toString(16)).join("");
    hashField.innerText = inputHex;
    let match = matchHashWithPassword(input);
    // console.log(match);
    if(Object.keys(match).length > 0){
        validPasswordField.innerHTML = `Het wachtwoord <i>${match.password}</i> is niet origineel, het staat op plaats #${match.index} van meest gebruikte wachtwoorden.`;
    } else {
        validPasswordField.innerHTML = `Dat wachtwoord herken ik niet, goed bezig.`;
    }
}

async function generateHash(input){
    const text = new TextEncoder("utf-8").encode(input);
    return await window.crypto.subtle.digest("SHA-256", text);
}

function matchHashWithPassword(input){
    let ret = {};
    passwords.forEach(x => {
        // if(x.password === "password") console.warn("checking password", arraysEqual(x.hash.split(""), input.split("")));
        if(arraysEqual(x.hash.split(""), input.split(""))){
            // console.log(performance.now());
            // console.warn(x.password);
            ret = x
            // return outer_function console.error("returning match");
            // console.error("skipped return statement");
        }
    })
    // console.log(performance.now());
    // console.warn("no passwords found");
    return ret;
}

function arraysEqual(a1, a2){
    return a1.every((x, i) => x === a2[i]);
}