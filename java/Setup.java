import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.Comparator;
import java.io.IOException;
import java.io.FileNotFoundException;

/**
 * The setup program for edict2-browser.
 */
public class Setup  {

  // Select a subset of the dictionary? ..
  private static boolean min = false;

  /**
   * Usage: java Setup [-min]
   *
   * For now edict2 must be located in the current directory.
   * Produces a file, edict2.js.
   * The dictionary is in Edict.entries, a two-dimensional array.
   * The entries are (re-)ordered by reading.
   *
   * @param args There is a single optional argument: -min
   * Select entries marked with the .../(P)/... tag.
   */
  public static void main(String[] args)  {
    processOptions(args);
    System.out.println("Setup edict2-browser: Please wait ...");
    edictToJavaScript();
  }

  /**
   *
   *
   */
  public static void edictToJavaScript()  {

    RandomAccessFile raf = null;
    BufferedWriter bw = null;
    Edict2Line[] lines;
    String line;
    String subset = "(P)";  // Flag that marks a minimal subset in edict.
    String[] splitLine;
    boolean first = true;
    int cutoff;

    try  {
      // This reads the dictionary and sorts the lines by reading ..
      lines = getLines();
      // re-read the file using the sort order in lines ..
      raf = new RandomAccessFile("edict2", "r");
      bw = new BufferedWriter(
             new OutputStreamWriter(
               new FileOutputStream("edict2.js"),
               "ISO-8859-1"
             )
           );
      line = raf.readLine();
      bw.write("var Edict = {};\n");
      bw.write("Edict.version = \"");
      bw.write(line);
      bw.write("\";\n");
      // Start the array
      bw.write("Edict.entries = [\n");
      for (int i = 0; i < lines.length; ++i)  {
        // lines is sorted.
        // EdictLine.pos is the position of the line in the file.
        raf.seek(lines[i].pos);
        line = raf.readLine();
        // reference number not used. trim it ..
        cutoff = line.indexOf("EntL");
        line = line.substring(0, cutoff);
        if (min)  {  // Filtering the minimal subset? ..
          // Look for "...(P).../"
          if (line.indexOf(subset) < 0) {
            continue;
          }
        }
        splitLine = line.split(" ", 2);
        // Terminate previous array literal (skip on first entry):
        if (!first)  {
            bw.write(",");
        }
        // Start array literal:
        bw.write("[");
        bw.write("\"");
        bw.write(splitLine[0]);
        bw.write("\",");
        bw.write("\"");
        // Test to see if there's a reading(it's optional):
        if (splitLine[1].charAt(0) == '[')  {
            splitLine = splitLine[1].split(" ", 2);
            String reading = splitLine[0].substring(1, splitLine[0].length() - 1);
            bw.write(reading);
            bw.write("\",");
            bw.write("\"");
            splitLine[1] = splitLine[1].replace("\"", "\\\"");
            bw.write(splitLine[1]);
            bw.write("\"");
        }
        else  {  // No reading
            bw.write("\",");
            bw.write("\"");
            // can't have double quote chars ..
            splitLine[1] = splitLine[1].replace("\"", "\\\"");
            bw.write(splitLine[1]);
            bw.write("\"");
        }
        // End array literal:
        bw.write("]");
        first = false;
      }

      // End the array
      bw.write("];\n");
    }
    catch (java.io.FileNotFoundException ex)  {
      System.out.println("Error: edict2 file not found.");
    }
    catch (Exception ex) {
      System.out.println(ex.toString());
    }
    finally  {
      try  {
        if (raf != null) raf.close();
        if (bw != null) bw.close();
      }
      catch (java.io.IOException ex)  {}
    }
  }

  /*
   * There is a single option.
   * -min  Take only a subset of the dictionary:
   *       entries marked with /(P)/.
   */
  private static void processOptions(String[] args)  {
    //String option;
    for (int i = 0; i < args.length; ++i)  {
      if (args[i].equals("-min"))  {
        min = true;
      }
    }
  }

  /*
   * Reads edict2 and orders the lines by reading.
   *
   * @return An array of Edict2Line, sorted by reading, entry.
   */
  private static Edict2Line[] getLines()
    throws java.io.IOException,
           java.io.FileNotFoundException  {
    long pos;
    String line;
    RandomAccessFile raf =
      new RandomAccessFile("edict2", "r");;
    ArrayList<Edict2Line> al =
      new ArrayList<Edict2Line>(250000);;
    Edict2Line[] lines;

    raf.readLine();  // skip header
    pos = raf.getFilePointer();
    line = raf.readLine();
    while (line != null)  {
      Edict2Line el = new Edict2Line();
      el.pos = pos;
      // <spellings><space><readings>...
      String[] splitLine = line.split(" ", 2);
      String field = splitLine[0];
      // take the first spelling ..
      int cutoff = field.indexOf(';');
      if (cutoff >= 0) {
        field = field.substring(0, cutoff);
      }
      // remove any annotations ..
      cutoff = field.indexOf('(');
      if (cutoff >= 0) {
        field = field.substring(0, cutoff);
      }
      el.entry =  // want unicode ordering ..
        new String(
          field.getBytes(),
          "EUC-JP"
        );
      field = splitLine[1];
      if (field.charAt(0) == '[')  {
        // <readings><space><glosses>
        field = field.split(" ", 2)[0];
        // strip brackets [...] ..
        field = field.substring(1, field.length() - 1);
        // take the first reading ..
        cutoff = field.indexOf(';');
        if (cutoff >= 0) {
          field = field.substring(0, cutoff);
        }
        // remove any annotations ..
        cutoff = field.indexOf('(');
        if (cutoff >= 0) {
          field = field.substring(0, cutoff);
        }
        el.reading =
          new String(field.getBytes(), "EUC-JP");
      }
      else  {
        el.reading = "";
      }
      al.add(el);
      pos = raf.getFilePointer();
      line = raf.readLine();
    }
    if (raf != null) raf.close();
    lines = al.toArray(new Edict2Line[0]);
    java.util.Arrays.sort(lines, new Edict2Line());
    return lines;
  }

  /*
   * A slice from a line in edict2, with its position in the file.
   * Used to order the lines by reading.
   */
  static class Edict2Line implements Comparator<Edict2Line>  {
    long pos;  // The start of the line.
    String entry;
    String reading;

    public int compare(Edict2Line el1, Edict2Line el2)  {
      String s1 = el1.reading;
      if (s1.equals(""))  {
        s1 = el1.entry;
      }
      String s2 = el2.reading;
      if (s2.equals(""))  {
        s2 = el2.entry;
      }
      int v = s1.compareTo(s2);
      if (v == 0)  {
        v = el1.entry.compareTo(el2.entry);
      }
      return v;
    }
  }
}
