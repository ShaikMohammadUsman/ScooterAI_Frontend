
function formatToHTML(inputText) {
    // Split the input text into lines
    const lines = inputText.split('\n');

    // Initialize the HTML string
    let htmlOutput = `<p>${lines[0]}</p>\n\n<ul>\n`;

    // Iterate over the lines and format them as list items
    for (let i = 1; i < lines.length - 1; i++) {
        if (lines[i]) {
            htmlOutput += `  <li>${lines[i].trim()}</li>\n`;
        }
    }

    // Close the unordered list tag and add the final paragraph
    htmlOutput += `</ul>\n\n<p>${lines[lines.length - 1]}</p>`;

    return htmlOutput;
}

function parseFormat(inputString) {
    // Split the input string by newline characters
    const parts = inputString.split('\n');

    // Regular expression to match <code>...</code> blocks
    const codeBlockPattern = /<code>[\s\S]*?<\/code>/;

    // Initialize an array to store the parsed parts
    const parsedParts = parts.map(part => {
        // Check if the part is a code block
        if (codeBlockPattern.test(part)) {
            // If it's a code block, return it as is
            return part;
        } else {
            // Otherwise, wrap the part in <p>...</p>
            return `<p>${part}</p>`;
        }
    });

    // Join the parsed parts back into a single string with newline characters
    const parsedString = parsedParts.join('\n');

    return parsedString;
}

function parseNewLines(inputString) {
    // Regular expression to match <code>...</code> blocks
    const codeBlockPattern = /(<pre[\s\S]*?<\/pre>)/;

    // Split the input string by the code blocks, keeping the code blocks in the result
    const parts = inputString.split(codeBlockPattern);

    // Initialize an array to store the parsed parts
    const parsedParts = parts.map(part => {
        // Check if the part is a code block
        if (codeBlockPattern.test(part)) {
            // If it's a code block, return it as is
            return part;
        } else {
            // Otherwise, split the part by newline characters and wrap each line in <p>...</p>
            return part.split('\n').map(line => `<p>${line}</p>`).join('<br/>');
        }
    });

    // Join the parsed parts back into a single string
    const parsedString = parsedParts.join('');

    return parsedString;
}


const htmlEntities = (p1) => {
    let p2 = p1.replace(/\*/g, '&#42;'); //asterics
    p2 = p2.replace(/\_/g, '&#95;'); //underscores
    p2 = p2.replace(/\`/g, '&#96;'); //backtics
    p2 = p2.replace(/\~/g, '&#126;'); //tilde
    p2 = p2.replace(/\^/g, '&#94;'); //caret
    p2 = p2.replace(/\-/g, '&#45;'); //minus sign
    p2 = p2.replace(/\!/g, '&#33;'); // exclamation mark
    p2 = p2.replace(/\"/g, '&#34;'); // double quote
    p2 = p2.replace(/\$/g, '&#36;'); // dollar sign
    p2 = p2.replace(/\%/g, '&#37;'); // percent
    p2 = p2.replace(/\'/g, '&#39;'); // single quote
    p2 = p2.replace(/\(/g, '&#40;'); // left parenthesis
    p2 = p2.replace(/\)/g, '&#41;'); // right parenthesis
    p2 = p2.replace(/\+/g, '&#43;'); // plus sign
    p2 = p2.replace(/\,/g, '&#44;'); // comma
    p2 = p2.replace(/\./g, '&#46;'); // period
    p2 = p2.replace(/\//g, '&#47;'); // forward slash
    p2 = p2.replace(/\:/g, '&#58;'); // colon
    p2 = p2.replace(/\=/g, '&#61;'); // equals sign
    p2 = p2.replace(/\?/g, '&#63;'); // question mark
    p2 = p2.replace(/\@/g, '&#64;'); // at sign
    p2 = p2.replace(/\[/g, '&#91;'); // left square bracket
    p2 = p2.replace(/\\/g, '&#92;'); // backslash
    p2 = p2.replace(/\]/g, '&#93;'); // right square bracket
    p2 = p2.replace(/\{/g, '&#123;'); // left curly brace
    p2 = p2.replace(/\|/g, '&#124;'); // vertical bar
    p2 = p2.replace(/\}/g, '&#125;'); // right curly brace

    return p2;
}

export const parseBasics = (str) => {
    str = str.replace(/\&/g, '&amp'); // ampersand to random &amp
    str = str.replace(/\#/g, '&#35;'); // hash
    str = str.replace(/\</g, '&#60;'); //less than symbol
    str = str.replace(/\>/g, '&#62;'); //greater than symbol
    // str = str.replace(/\//g, '&#47;'); // forward slash
    str = str.replace(/\(([\s\S]*?)\)/gs, (match, p1) => {
        // Modify the special characater inside the matched content
        let parsedTxt = htmlEntities(p1);
        return `(${parsedTxt})`;
    });
    str = str.replace(/\/```([\s\S]+?)```\//gs, (match, p1) => {
        // Modify the special characater inside the matched content
        let backtics = p1.replace(/\`/g, '&#96;'); //backtics
        return `/${backtics}/`;
    });
    str = str.replace(/\"([\s\S]+?)\"/gs, (match, p1) => {
        // Modify the special characater inside the matched content
        let parsedTxt = htmlEntities(p1);
        return `"${parsedTxt}"`;
    });
    str = str.replace(/\//g, '&#47;'); // forward slash
    str = str.replace(/````([\s\S]+?)````/gs, "`$1`")
    return str;
}

const parseBold = (str) => {
    return str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

const parseItalic = (str) => {
    return str.replace(/\*(?!=\s)(.+?)(?!=\s)\*/g, "<em>$1</em>");
}

const parseUnderline = (str) => {
    return str.replace(/\_\_(.+?)\_\_/g, "<u>$1</u>")
}
const parseStrikeThrough = (str) => {
    return str.replace(/\~\~(.+?)\~\~/g, "<del>$1</del>");
}

const parseBackticks = (str) => {
    // return str.replace(/(?<=\s|\n)```([\s\S]+?)```(?<=\s|\n)/gs, (match, p1) => {
    return str.replace(/```([\s\S]+?)```/gs, (match, p1) => {
        // Modify the special characater inside the matched contents
        let parsedTxt = htmlEntities(p1);
        return `<pre style="background-color:#033c6e; border-radius:0.25rem; overflow-x:scroll; scrollbar-width:none; padding:0.25rem"><code class="p-2 rounded overflow-x-scroll scrollbar-hide bg-[#666]">${parsedTxt}</code></pre>`;
        // return `<pre><code style="padding: 0.2rem; border-radius: 0.25rem; overflow-x: scroll; scrollbar-width: none; background-color: #444;>${parsedTxt}</code></pre>`;
    });

}

//this is for technical coding words
const parseCode = (str) => {
    return str.replace(/`([^`]+)`/gs, (match, p1) => {
        // Modify the special characater inside the matched content
        let parsedTxt = htmlEntities(p1);
        return `<code style="background-color:#444; padding:0.1rem" class="p-2 rounded overflow-x-scroll scrollbar-hide bg-[#888]" >${parsedTxt}</code>`;
        // return `<code style="padding: 0.2rem; border-radius: 0.25rem; overflow-x: scroll; scrollbar-width: none; background-color: #444; >${parsedTxt}</code>`;

    });

}
const parseSuperscript = (str) => {
    return str.replace(/\^(\w+)/g, "<sup>$1</sup>");
}

const parseSubscript = (str) => {
    return str.replace(/(\w+)\^/g, "<sub>$1</sub>");
}

const parseDash = (str) => {
    return str.replace(/^(?<!\w)[\*\-]/g, "<br/>=>") // can add any character that we have check within the square bracket
}

const parseUrl = (str) => {
    return str.replace(/(?:(https?):\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/g, "<a href='$1$2$3'>$1$2$3</a>");
}

const formatText = (text) => {
    let str = text;

    str = parseBasics(str);
    str = parseBackticks(str);
    str = parseCode(str);
    str = parseBold(str);
    str = parseItalic(str);
    str = parseStrikeThrough(str);
    str = parseUnderline(str);
    str = parseSubscript(str);
    str = parseSuperscript(str);
    // console.log(str);
    str = parseNewLines(str);
    str = str.replace(/\&amp/g, '&amp;'); //parsing back the ampersand to &
    // str = formatToHTML(str);
    // str = parseUrl(str);
    // str = parseDash(str);
    return str;

}

export default formatText;