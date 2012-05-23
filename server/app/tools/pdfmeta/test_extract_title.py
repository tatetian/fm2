# encoding: utf8
'''
Unittest for extract_title module
'''
import extract_title
import unittest
import os
import glob

class TestExtractTitle(unittest.TestCase):
  def test_dir(self):
    path = 'dataset'
    for infile in glob.glob(os.path.join(path, '*.pdf.json') ):
      title = infile[len(path)+1:].split('.')[0]
      self._test_one_case(path, title)
  def test(self):
    self._test_one_case("dataset", "A critique of ANSI SQL isolation levels")
  def _test_one_case(self, dataset_dir, title):
    input_json_file_path = dataset_dir + "/" + title + ".pdf.json"
    json_str = open(input_json_file_path).read()
    json_object = extract_title.process(json_str)
    extracted_title = json_object['title']
    expected_title = ''.join(extracted_title.lower().split(':'))
    title = title.lower()
    if title != expected_title:
      print 'Expected ' + title + '\n Not ' + expected_title
if __name__ == "__main__":
  unittest.main()
