/* 
 *   JavaScript Obfucator is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   JavaScript Obfucator is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, write to the Free Software
 *   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.StringTokenizer;

/**
 * Obfuscate the JavaScript code.
 * @author Shane Ng <starford at gmail dot com>
 */
public class JSO {
    public static final String[] reserved = {
        "abstract", "else", "instanceof", "switch", "boolean", "enum", "int", 
        "synchronized", "break", "export", "interface", "this", "byte", "extends", 
        "long", "throw", "case", "false", "native", "throws", "catch", "final", 
        "new", "transient", "char", "finally", "null", "true", "class", "float", 
        "package", "try", "const", "for", "private", "typeof", "continue", "function", 
        "protected", "var", "debugger", "goto", "public", "void", "default", "if", 
        "return", "volatile", "delete", "implements", "short", "while", "do", "import", 
        "static", "with", "double", "in", "super", "undefined", "arguments"
    };

    public static final String[] builtIn = {
        "alert", "hidden", "outerWidth", "all", "history", "packages", "anchor", 
        "image", "pageXOffset", "anchors", "images", "pageYOffset", "area", "isNaN", 
        "parent", "array", "java", "parseFloat", "assign", "JavaArray", "parseInt", 
        "blur", "JavaClass", "password", "button", "JavaObject", "pkcs11", "checkbox", 
        "JavaPackage", "plugin", "clearTimeout", "innerHeight", "prompt", 
        "clientInformation", "innerWidth", "prototype", "close", "layer", "radio", 
        "closed", "layers", "reset", "confirm", "length", "screenX", "crypto", "link", 
        "screenY", "date", "location", "scroll", "defaultStatus", "Math", "secure", 
        "document", "mimeTypes", "select", "element", "name", "self", "elements", "navigate", 
        "setTimeout", "embed", "navigator", "status", "embeds", "netscape", "String", 
        "escape", "Number", "submit", "eval", "Object", "sun", "event", "offscreenBuffering", 
        "taint", "fileUpload", "onblur", "text", "focus", "onerror", "textarea", "form", 
        "onfocus", "top", "forms", "onload", "toString", "frame", "onunload", "unescape", 
        "frames", "open", "untaint", "frameRate", "opener", "valueOf", "function", "option", 
        "window", "getClass", "outerHeight",
        "setInterval", "clearInterval", "setTimeout", "clearTimeout"
    };

    public static final char[] DELIMITER = {'?', ':', '!', '=', '(', ')', '[', ']', 
        '{', '}', '\r', '\n', '\t', ' ', '\"', '\'', '<', '>', ',', '.', '/', 
        '\\', '+', '-', '*', '&', '|', '^', '%', ';'
    };


    public static final String[] alpha = {
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", 
        "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "$", "_"
    };

    public static final HashSet exclusionTokenSet = new HashSet();
    public static final HashSet privatePrefixSet = new HashSet();

    public static int ref = alpha.length;
    public static HashMap map = new HashMap();

    public static final String ARG_EXCLUDE_TOKENS = "e=";
    public static final String ARG_DESTINATION_DIR = "d=";
    public static final String ARG_OBFUSCATE_STRING = "o=";
    public static final String ARG_PRIVATE_PREFIX = "p=";

    private double[] stringObfuscationParameter = {0, 0, 0.5};
    private String[] file = null;
    private String destinationDir = null;
    private JSOState state = new JSOState();
    private String delimiter = new String(DELIMITER);

    public static void main(String[] args) throws Exception {
        ArrayList fileList = new ArrayList(args.length);
        String[] file = null;
        String destinationDir = null;
        double[] stringObfuscationParameter = {0, 0, 0.5};

        if (args.length == 0) {
            printUsage();
            return;
        } else if (args.length > 1) {
            for (int i = 0; i < args.length; i++) {
                if (args[i].startsWith(ARG_EXCLUDE_TOKENS)) {
                    readExclusionTokenSet(args[i].substring(ARG_EXCLUDE_TOKENS.length()));
                } else if (args[i].startsWith(ARG_DESTINATION_DIR) && destinationDir == null) {
                    File dir = new File(args[i].substring(ARG_DESTINATION_DIR.length()));
                    if (!dir.exists() && !dir.mkdirs()) {
                        System.err.println("Cannot create the output directory \"" + dir.getName() + "\"");
                        return;
                    } else if (dir.exists() && dir.isFile()) {
                        System.err.println("The output parameter \"" + args[i] + "\" is not a directory");
                        return;
                    }
                    destinationDir = dir.getName();
                } else if (args[i].startsWith(ARG_OBFUSCATE_STRING)) {
                    String[] param = args[i].substring(ARG_OBFUSCATE_STRING.length()).split(",", 3);
                    if (param.length >= 2) {
                        try {
                            stringObfuscationParameter[0] = Double.parseDouble(param[0]);
                            stringObfuscationParameter[1] = Double.parseDouble(param[1]);
                            if (param.length == 3) {
                                stringObfuscationParameter[2] = Double.parseDouble(param[2]);
                            }
                        } catch (NumberFormatException e) {
                            System.err.println("The obfuscation parameters are not numbers.");
                            return;
                        }
                    } else {
                        System.err.println("At least 2 obfuscation parameters are required, e.g. o=0.4,0.7.");
                        return;
                    }
                } else if (args[i].startsWith(ARG_PRIVATE_PREFIX)) {
                    String[] prefix = args[i].substring(ARG_PRIVATE_PREFIX.length()).split(",");
                    for (int j = 0; j < prefix.length; j++) {
                        if (prefix[j].length() > 0) {
                            privatePrefixSet.add(prefix[j]);
                        }
                    }
                } else {
                    fileList.add(args[i]);
                }
            }
            file = new String[fileList.size()];
            fileList.toArray(file);
        } else {
            file = new String[]{args[0]};
        }
        addExclusionTokenSet(reserved);
        addExclusionTokenSet(builtIn);

        JSO obfuscator = new JSO(file, destinationDir, stringObfuscationParameter);
        obfuscator.run();
    }

    private static void printUsage() {
        System.err.println("Usage: java JSO <list of javascript file> [options]");
        System.err.println("where the options are:");
        System.err.println("\te=<exception list file>");
        System.err.println("\t\t- filename of the exception list");
        System.err.println("\t\t- exception tokens are delimited by tab, space, dot, comma, ");
        System.err.println("\t\t  single quote and double quote");
        System.err.println("\td=<destination directory>");
        System.err.println("\t\t- the output directory");
        System.err.println("\t\t- print to the STDOUT if not specified");
        System.err.println("\to=<obfuscation parameters of string literals>");
        System.err.println("\t\t- If it is specified, the characters in string literals will be ");
        System.err.println("\t\t  encoded to either \\uXXXX (hexidemcial) or \\XXX (octal) format");
        System.err.println("\t\t- The parameters are a 2 or 3 floating point values delimited ");
        System.err.println("                  by commas. e.g. 0.5,0.3 or 0.5,0.3,0.9");
        System.err.println("\t\t- The values are ");
        System.err.println("\t\t  * probability to encode a token in a string literal");
        System.err.println("\t\t  * probability to encode a character in a candidate token");
        System.err.println("\t\t  * probability to encode a character into \\uXXXX format");
        System.err.println("\t\t- The last parameter is set to 0.5 if not specified");
        System.err.println("\tp=<prefix for private members>");
        System.err.println("\t\t- \"private\" prefix to ensure that functions/variables preceeded");
        System.err.println("\t\t  by the prefix are obfuscated even when preceded by \"this.\"");
        System.err.println("");
        System.err.print("Press Enter to read the examples...");
        try{
            System.in.read();
        } catch (Exception e){}
        System.err.println("Examples:");
        System.err.println("");
        System.err.println(" Obfuscate all scripts in the current directory and output to ./out directory:");
        System.err.println("\tjava JSO *.js d=out");
        System.err.println("");
        System.err.println(" Pipe the STDOUT output to x.o.js:");
        System.err.println("\tjava JSO x.js > x.o.js ");
        System.err.println("");
        System.err.println(" Obfuscate class member preceded by \"_\" or \"__\" (e.g. this._foo ):");
        System.err.println("\tjava JSO *.js p=_,__");
        System.err.println("");
        System.err.println(" Merge a.js and b.js and pipe the merged output to script.js. Tokens in ");
        System.err.println("  exception list, noReplace.txt will not be replaced:");
        System.err.println("\tjava JSO a.js b.js e=noReplace.txt > script.js");
        System.err.println("");
        System.err.println(" Obfuscate the 100% of string literals, 68% of the characters will be encoded. ");
        System.err.println("  50% of the characters will be encoded as \\uXXXX format (default):");
        System.err.println("\tjava JSO x.js o=1,0.68");
    }

    public JSO(String[] file, String destinationDir, double[] stringObfuscationParameter){
        this.file = file;
        this.destinationDir = destinationDir;
        if (stringObfuscationParameter != null && stringObfuscationParameter.length == 3) {
            this.stringObfuscationParameter = stringObfuscationParameter;
        }
    }

    public void run() throws IOException {
        for (int i = 0; i < file.length; i++) {
            BufferedReader in = new BufferedReader(new FileReader(file[i]));
            PrintWriter out = null;

            if (destinationDir == null) {
                out = new PrintWriter(System.out, true);
                this.obfuscate(in, out);
                out.flush();
            } else {
                out = new PrintWriter(new FileWriter(new File(destinationDir + File.separator + file[i])));
                this.obfuscate(in, out);
                out.flush();
                out.close();
            }

            in.close();
        }
        System.err.println(map);
    }

    public void obfuscate(BufferedReader in, PrintWriter out) throws IOException {
        state.reset();

        for (String line = in.readLine(); line != null; line = in.readLine()) {
            line = line.trim();
            if (line.length() == 0) {
                continue;
            }
            StringTokenizer st = new StringTokenizer(line, delimiter, true);

            if (st.hasMoreTokens()) {
                state.setToken(st.nextToken());
            }

            for (; state.token != null; state.skipToken()) {
                if (st.hasMoreTokens()) {
                    state.setNextToken(st.nextToken());
                } else {
                    state.noToken();
                }

                boolean doubleSlashed = state.flipFlags();
                if (doubleSlashed) {
                    break;
                }

                handleToken(out);
            }

            if (!state.delimiter && !state.commented) {
                out.println();
            }
        }
    }

    private void handleToken(PrintWriter out) {
		if (state.token.length() > 0) {
            if (state.delimiter) {
                if (state.inString() && !state.backslashed && state.c != '\\' && state.c != '\"' && state.c != '\'') {
                    state.token = obfuscateQuotedString(state.token);
                }
            } else {
                if (state.inString()) {
                    if (!state.backslashed && !exclusionTokenSet.contains(state.token)) {  //CAIRO: remove exclusionTokenSet.contains(state.token) to get original file!
                        state.token = obfuscateQuotedString(state.token);
                    }
                } else if (state.isReplacableToken() && canReplace(state.token) && (state.c2 != ':')) {	//CAIRO: remove (state.c2 != ':') to get original file!
                    state.token = generateToken(state.token);
                }
            }
        }

        if (!state.commented && (state.printToken || state.inString())) {
            out.print(state.token);
        }

        if (state.c == '}' && !state.commented && !state.inString()) {
            out.println();
        }
    }

    private static void readExclusionTokenSet(String file) throws IOException {
        BufferedReader in = null;
        try {
            in = new BufferedReader(new FileReader(file));
            for (String line = in.readLine(); line != null; line = in.readLine()) {
                StringTokenizer st = new StringTokenizer(line, "\t ,.\"\'");
                for (; st.hasMoreTokens();) {
                    exclusionTokenSet.add(st.nextToken());
                }
            }
        } finally {
            if (in != null) {
                in.close();
            }
        }
    }

    private String obfuscateQuotedString(String token) {
        if (Math.random() < stringObfuscationParameter[0]) {
            StringBuffer buffer = new StringBuffer(token.length());
            int n = token.length();
            int pos = 0;
            for (int i = 0; i < n; i++) {
                if (Math.random() < stringObfuscationParameter[1]) {
                    buffer.append(token.substring(pos, i));
                    encode(token.charAt(i), buffer);
                    pos = i + 1;
                }
            }
            if (pos < n) {
                buffer.append(token.substring(pos));
            }
            return buffer.toString();
        } else {
            return token;
        }
    }

    private void encode(char c, StringBuffer buffer) {
        if (Math.random() < stringObfuscationParameter[2] || c > 077) {
            buffer.append("\\u");
            encode(c, 16, 4, buffer);
        } else {
            buffer.append("\\");
            encode(c, 8, 3, buffer);
        }
    }

    private void encode(char c, int radix, int length, StringBuffer buffer) {
        String value = Integer.toString(c, radix);
        int n = length - value.length();

        if (n > 0) {
            for (int i = 0; i < n; i++) {
                buffer.append('0');
            }
            buffer.append(value);
        } else {
            buffer.append(value.substring(-n));
        }
    }

    private static String generateToken(String token) {
        if (map.containsKey(token)) {
            return (String) map.get(token);
        } else {
            String result = null;
            do {
                StringBuffer buffer = new StringBuffer(token.length());
                for (int i = ref; i > 0; i = i / alpha.length) {
                    buffer.append(alpha[i % alpha.length]);
                }

                ref++;
                result = buffer.toString();
            } while (exclusionTokenSet.contains(result));

            map.put(token, result);
            return result;
        }
    }

    private static boolean canReplace(String token) {
        if (token.length() <= 1) {
            return false;
        }

        if (token.length() > 0) {
            if (Character.isUpperCase(token.charAt(0))) {
                return false;
            }

            if (Character.isDigit(token.charAt(0))) {
                return false;
            }

            if (exclusionTokenSet.contains(token)) {
                return false;
            }
        }
        return true;
    }

    public static void addExclusionTokenSet(String[] array) {
        if (array != null) {
            for (int i = 0; i < array.length; i++) {
                exclusionTokenSet.add(array[i]);
            }
        }
    }

    public static boolean isDelimiter(String token) {
        if (token != null && token.length() > 0) {
            for (int i = 0; i < DELIMITER.length; i++) {
                if (token.charAt(0) == DELIMITER[i]) {
                    return true;
                }
            }
        }
        return false;
    }

}

class JSOState {
    boolean dotted = false;
    boolean doubleQuoted = false;
    boolean singleQuoted = false;
    boolean backslashed = false;
    boolean commented = false;
    boolean printToken = true;
    boolean delimiter = false;

    String token;
    String lastToken;
    String nextToken;

    char c0 = 0;
    char c = 0;
    char c2 = 0;

    void reset() {
        dotted = false;
        doubleQuoted = false;
        singleQuoted = false;
        backslashed = false;
        commented = false;
        printToken = true;
        delimiter = false;

        token = null;
        lastToken = null;
        nextToken = null;

        c0 = 0;
        c = 0;
        c2 = 0;
    }

    boolean printable() {
        return !commented && (printToken || inString());
    }

    boolean inString() {
        return doubleQuoted || singleQuoted;
    }

    boolean isReplacableToken() {
        if (commented) {
            return false;
        }

        for (Iterator itr = JSO.privatePrefixSet.iterator(); itr.hasNext(); ) {
            String prefix = (String) itr.next();
            if (this.token.startsWith(prefix)) return true; 
        }

        return !dotted;
    }

    boolean delimiterSurrounded() {
        return !JSO.isDelimiter(nextToken) && !JSO.isDelimiter(lastToken);
    }

    boolean isWhitespace(){
        return Character.isWhitespace(c);
    }

    String setToken(String value) {
        String oldToken = lastToken;
        lastToken = token;
        token = value;
        nextToken = null;

        if (value != null) {
            c0 = c;
            c = token == null ? 0 : token.charAt(0);
            c2 = 0;

            backslashed = c0 == '\\';
            dotted = c0 == '.';
            delimiter = JSO.isDelimiter(token);
            printToken = true;
        }

        return oldToken;
    }

    String tokenBackslashed() {
        String result = null;
        int index = 0;
        if (c == 'u') {
            index = 4;
        } else if (Character.isDigit(c)) {
            index = 3;
        } else {
            throw new IllegalStateException("Token not backslashed or invalid JavaScript syntax.");
        }
        result = token.substring(0, index);
        token = token.substring(index);

        return result;
    }

    void setNextToken(String value) {
        nextToken = value;
        c2 = value.charAt(0);
    }

    void skipToken() {
        this.setToken(nextToken);
    }

    void noToken() {
        nextToken = null;
        c2 = 0;
    }

    boolean flipFlags() {
        if (isWhitespace()) {
            printToken = delimiterSurrounded();
        } else if (c == '/' && !(singleQuoted || doubleQuoted)) {
            if (!commented && c2 == '/') {
                return true;
            } else if (!commented && c2 == '*' && 
                    !inString()) {
                commented = true;
            } else if (commented && c0 == '*') {
                commented = false;
                printToken = false;
            }
        } else if (c == '\"' && !singleQuoted && !backslashed && !commented) {
            doubleQuoted = !doubleQuoted;
        } else if (c == '\'' && !doubleQuoted && !backslashed && !commented) {
            singleQuoted = !singleQuoted;
        }
        return false;
    }
}