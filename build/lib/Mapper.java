/**
 * Task definition for the mapper task.
 *
 * The mapper task replaces all function calls with their encoded values.  The primary
 * usage of this class is to replace all JavaScript function calls in the .jsp files with the
 * encoded function names, right after the JavaScript files have been encoded/deployed.
 *
 */

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FilenameFilter;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.StringTokenizer;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;


/**
 * For those of us who always forget how to compile from the command line:
 *
 * javac -classpath C:\apache-ant-1.7.0\lib\ant.jar -d . Mapper.java
 * jar cvf ant-mapper.jar *.class
 */

public class Mapper extends Task {

    private final String DEFAULT_DELIMITER   = ",";
    private final String KEY_VALUE_DELIMITER = "=";

    private String map;
    private String delimiter;
	private String jsMethods;
	private String jspFiles;
    private String inputDir;
    private String outputDir;

	private ArrayList JSP_FILES;
	private ArrayList CLEAR_JS_METHOD_NAMES;


	/**
	 * Constructor.
	 */
    public Mapper() {
        this.map       = null;
        this.delimiter = null;
        this.jsMethods = null;
        this.jspFiles  = null;
        this.inputDir  = null;
        this.outputDir = null;
    }
   
	// Setters
	public void setMap(String val) {
        this.map = val;
    }

	public void setDelimiter(String val) {
        this.delimiter = val;
    }

	public void setJsMethods(String val) {
        this.jsMethods = val;
    }

	public void setJspFiles(String val) {
        this.jspFiles = val;
    }

    public void setInputDir(String val) {
        this.inputDir = val;
    }

    public void setOutputDir(String val) {
        this.outputDir = val;
    }

	
	private void initMembers() {
		// init JSP_FILES
		JSP_FILES = new ArrayList();
		StringTokenizer tokenizer = new StringTokenizer(jspFiles, DEFAULT_DELIMITER);
		while(tokenizer.hasMoreTokens()) {
			String nextToken = tokenizer.nextToken().trim();
			JSP_FILES.add(nextToken);
		}

		// init CLEAR_JS_METHOD_NAMES
		CLEAR_JS_METHOD_NAMES = new ArrayList();
		if(jsMethods!=null) {
			tokenizer = new StringTokenizer(jsMethods, DEFAULT_DELIMITER);
			while(tokenizer.hasMoreTokens()) {
				String nextToken = tokenizer.nextToken().trim();
				CLEAR_JS_METHOD_NAMES.add(nextToken);
			}
		}
	}

    
	/**
	 * This is the main entry point of the class.
	 * It replaces all instanes of the CLEAR_JS_METHOD_NAMES in all INPUT_FILES with
	 * the mapped (encoded) js method names.
	 */
    public void execute() throws BuildException {
        
		// input validation
        if(map == null) throw new BuildException("You must provide a map to be broken into tokens.");
        if(jspFiles == null) throw new BuildException("You must provide a list of JSP files to process.");
        if(inputDir == null) throw new BuildException("You must provide an input directory to process.");
        if(outputDir == null) throw new BuildException("You must provide an output directory.");
        if(delimiter == null) delimiter = DEFAULT_DELIMITER;
		if(!inputDir.endsWith("/")) inputDir = inputDir + "/";
		if(!outputDir.endsWith("/")) outputDir = outputDir + "/";

		// debug
		System.out.println("==========");
		System.out.println("map: <" + map + ">");
		System.out.println("delimiter: <" + delimiter + ">");
		System.out.println("jsMethods: <" + jsMethods + ">");
		System.out.println("jspFiles: <" + jspFiles + ">");
		System.out.println("inputDir: <" + inputDir + ">");
		System.out.println("outputDir: <" + outputDir + ">");
		System.out.println("==========");

		// init JSP_FILES, CLEAR_JS_METHOD_NAMES
		initMembers();

		// get the list of files in directory
		//ExtensionFilter filter = new ExtensionFilter(".jsp");
		File theDir = new File(inputDir);
		String[] theDirContents = theDir.list();
		String lineSep = System.getProperty("line.separator");

		try {

			// iterate thru each file in the directory, and process each
			for(int i = 0; i < theDirContents.length; i++) {
				// only process JSP_FILES
				//System.out.println("theDirContents[i]: <" + theDirContents[i] + ">...");
				if(!JSP_FILES.contains(theDirContents[i])) continue;

				// at this point we know we have to process
				String fileName = inputDir + theDirContents[i];
				System.out.println("Processing <" + fileName + "> ...");
				
				// read contents of the file into a StringBuffer
				BufferedReader br = new BufferedReader(new FileReader(fileName));
				String nextLine = "";
				StringBuffer sb = new StringBuffer();
				while ((nextLine = br.readLine()) != null) {
					sb.append(nextLine);
					sb.append(lineSep);		// note: BufferedReader strips the EOL character
				}
				String fileContents = sb.toString();
				//System.out.println("fileContents: " + fileContents);

				// iterate thru each token
				StringTokenizer tokenizer = new StringTokenizer(map, delimiter);
				while(tokenizer.hasMoreTokens()) {
					String nextToken = tokenizer.nextToken().trim();
					int equalSign = nextToken.indexOf(KEY_VALUE_DELIMITER);
					String nextKey = nextToken.substring(0, equalSign);
					String nextValue = nextToken.substring(equalSign + 1);
					//System.out.println("nextKey: <" + nextKey + ">");
					//System.out.println("CLEAR_JS_METHOD_NAMES.contains(nextKey): <" + CLEAR_JS_METHOD_NAMES.contains(nextKey) + ">");
					if((jsMethods==null || CLEAR_JS_METHOD_NAMES.contains(nextKey)) && (fileContents.indexOf(nextKey) > -1)) {
						// replace only methods that are:
						//		- in the CLEAR_JS_METHOD_NAMES
						//		- the current file has a call to them

						if(nextKey.indexOf("[") > -1) {
							// these need special encoding --> [ has special meaning for replaceAll()
							int bracket = nextKey.indexOf("[");
							nextKey = nextKey.substring(0, bracket) + "\\" + nextKey.substring(bracket);
							//System.out.println("nextKey: <" + nextKey + ">");
						}

						if(nextValue.indexOf("$") > -1) {
							// these need special encoding --> $ has special meaning for replaceAll()
							int dollarSign = nextValue.indexOf("$");
							nextValue = nextValue.substring(0, dollarSign) + "\\" + nextValue.substring(dollarSign);
							//System.out.println("nextValue: <" + nextValue + ">");
						}
						
						fileContents = fileContents.replaceAll(nextKey, nextValue);
						System.out.println("\treplaced:\t" + nextKey + "  -->  " + nextValue);
					}
				}
				//System.out.println("NEW fileContents: " + fileContents);

				// write the replaced result file out into outputdir
				String outputFileName = outputDir + theDirContents[i];
				BufferedWriter out = new BufferedWriter(new FileWriter(outputFileName));
				out.write(fileContents);
				out.close();
				System.out.println("Done");
			}

		} catch(Exception e) {
			System.out.println("Exception: " + e.toString());
			e.printStackTrace();
		}
		
        // set a variable back in the build.xml file for ant
        //getProject().setUserProperty("tokenIndex", "hello");
    }


	/**
	 * Helper class that implements a Java FilenameFilter interface.
	 * This class helps to filter out only files with a certain extension only.
	 */
	class ExtensionFilter implements FilenameFilter {
		private String extension;
		public ExtensionFilter(String extension) {
			this.extension = extension;
		}
		public boolean accept(File dir, String name) {
			return name.endsWith(extension);
		}
	}

}