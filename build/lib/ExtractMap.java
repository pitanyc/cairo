/**
 * Task definition for the extract map task.
 *
 * This task is used to load the encoded JS map back into ant from the encode.js file.
 */

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FilenameFilter;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.StringTokenizer;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;


/**
 * For those of us who always forget how to compile from the command line:
 *
 * javac -classpath C:\apache-ant-1.7.0\lib\ant.jar -d . ExtractMap.java
 * jar cvf ant-mapper.jar *.class
 */

public class ExtractMap extends Task {

    private String mapfile;
    private String regexp;
    private String property;


	/**
	 * Constructor.
	 */
    public ExtractMap() {
        this.mapfile   = null;
        this.regexp    = null;
        this.property  = null;
    }
   
	// Setters
	public void setMapfile(String val) {
        this.mapfile = val;
    }

	public void setRegexp(String val) {
        this.regexp = val;
    }

    public void setProperty(String val) {
        this.property = val;
    }    
    
	/**
	 * This is the main entry point of the class.
	 * It replaces all instanes of the CLEAR_JS_METHOD_NAMES in all INPUT_FILES with
	 * the mapped (encoded) js method names.
	 */
    public void execute() throws BuildException {
        
		// input validation
        if(mapfile == null) throw new BuildException("You must provide a mapfile.");
        if(property == null) throw new BuildException("You must provide a property.");

		// debug
		System.out.println("==========");
		System.out.println("mapfile: <" + mapfile + ">");
		System.out.println("regexp: <" + regexp + ">");
		System.out.println("property: <" + property + ">");
		System.out.println("==========");

		String lineSep = System.getProperty("line.separator");
		String groupStr = "";

		try {

			// read contents of the file into a StringBuffer
			BufferedReader br = new BufferedReader(new FileReader(mapfile));
			String nextLine = "";
			StringBuffer sb = new StringBuffer();
			while ((nextLine = br.readLine()) != null) {
				sb.append(nextLine);
				sb.append(lineSep);		// note: BufferedReader strips the EOL character
			}
			String fileContents = sb.toString();
			//System.out.println("fileContents: " + fileContents);

			// compile and use regular expression
			Pattern pattern = Pattern.compile(regexp);
			Matcher matcher = pattern.matcher(fileContents);
			boolean matchFound = matcher.find();
			if (matchFound) {
				// get all groups for this match
				for (int i=0; i<=matcher.groupCount(); i++) {
					groupStr = matcher.group(i);
				}
			}

		} catch(Exception e) {
			System.out.println("Exception: " + e.toString());
			e.printStackTrace();
		}
		
        // set a variable back in the build.xml file for ant
        getProject().setUserProperty(property, groupStr.substring(1, groupStr.length() - 1));
    }

}