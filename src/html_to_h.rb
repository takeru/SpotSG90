s = File.read(__dir__ + "/index.html")
s.gsub!(/\n/, "\\n");
s.gsub!(/\"/, '\"');
#s = "#define _INDEX_HTML \"#{s}\""
#s = "static const char* _INDEX_HTML = \"#{s}\";"
s = "const char index_html[] PROGMEM = \"#{s}\";"
File.write(__dir__ + "/../include/index_html.h", s)
