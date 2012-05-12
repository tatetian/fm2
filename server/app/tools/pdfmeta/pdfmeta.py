# encoding: utf8
'''
Extract metadata from PDF

Input: JSON representation of the PDF file(output from pdf2json)
Output: JSON reprensetation of the input PDF file with metadata  
including tile, author, year
'''
import json

META_TITLE_MAX_LEN = 100

class PdfMeta:
    def __init__(self, pdf_json):
        self._pdf_json = json.loads(pdf_json)
        self._meta = {}
    def process(self):
        shared = {}
        self._extract_title(self._meta, shared)
        self._extract_authors(self._meta, shared)
        self._extract_date(self._meta, shared)
        return self._meta
    def json(self):
        return self._meta
    def __str__(self):
        return json.dumps(self._meta)#, indent=2)
    def _extract_title(self, meta, shared):
        # assume the title is on the first page
        first_page = self._pdf_json['pages'][0]
        blocks = first_page['blocks']
        # assume the title is the lines with largest font
        # find it
        max_line = {'bi': -1, 'li': -1}
        max_size = -1
        for bi, b in enumerate(blocks):
            lines = b['lines']
            for li, l in enumerate(lines):
                size = l['b'] - l['t']
                if max_size < 0.95 * size:
                    max_line['bi'] = bi
                    max_line['li'] = li
                    max_size = size
        if max_size < 0:                # CANNOT find title
            meta['title'] = ''
            return
        # construct the title
        bi  = max_line['bi']              # block index
        li  = max_line['li']              # line  index
        b   = blocks[bi]                  # title in this block
        lines   = b['lines'][li+1:]       # title among these lines
        title   = ' '.join(b['lines'][li]['s'])
        li_end  = li + 1
        for l in lines:
            # the lines of title should be the same size as max_size
            # otherwise skip the line
            size = l['b'] - l['t']
            if size < max_size:
                continue
            # append the title
            title   += ' '
            title   += ' '.join(l['s'])
            li_end  += 1
            # stop if title is too long
            if len(title) > META_TITLE_MAX_LEN:
                break
        # save title
        meta['title'] = title
        # record the postion of title
        shared['title_block_index']     = bi
        shared['title_end_line_index']  = li_end
    def _extract_authors(self, meta, shared):
        # if not found title, stop
        if not meta.has_key('title') or len(meta['title']) == 0:
            meta['authors'] = []
            return
        # assume authors are just behind title
        authors = []
        # find the first line after title
        authro_line = None
        first_page = self._pdf_json['pages'][0]
        blocks = first_page['blocks']
        bi = shared['title_block_index']
        li = shared['title_end_line_index']
        if len(blocks[bi]['lines']) > li:       # if in current block
            author_line = blocks[bi]['lines'][li]
        elif len(blocks) > bi + 1:              # if there is a next block
            author_line = blocks[bi+1]['lines'][0]
        # parse the line to determine the authors
        authors = self._parse_author_line(author_line)
        # save authors
        meta['authors'] = authors
    def _parse_author_line(self, author_line):
        # check arg
        if author_line == None:
            return []
        # split the line into author names
        author_names = []
        name = ''
        import sys
        min_space = sys.maxint 
        q = author_line['q']
        num_words = len(author_line['s'])
        for i in range(num_words):
            word =  author_line['s'][i].strip(' ,1234567890')
            # 'and' separates names
            if word == 'and':
                author_names.append(name)
                name = ''
                continue
            # cat parts of name
            if name != '':
                name += ' '
            name += word
            # ',' separates names
            if author_line['s'][i].find(',') >= 0:
                author_names.append(name)
                name = ''
                continue
            # if end of line
            if i == num_words - 1:
                author_names.append(name)
                name = ''
                break
            # if this word is the end of the author name
            space = q[2*i+2] - ( q[2*i] + q[2*i+1] )     # space between words
            if space > 2 * min_space:
                author_names.append(name)
                name = ''
                continue
            min_space = min(space, min_space)
        return author_names
    def _extract_date(self, meta, shared):
        if not self._pdf_json.has_key('mod_date'):
            return
        mod_date = self._pdf_json['mod_date']   # format like '2007-11-13'
        meta['date'] = mod_date[:4] + mod_date[5:7] + mod_date[8:10]  

import unittest
import subprocess
class TestPdfMeta(unittest.TestCase):
    def testOneAuthor(self):
        pdf_file = 'testcases/one_author.pdf'
        expected_result = {
            'title': u'Comparing GPU and CPU in OLAP Cubes Creation',
            'authors': [u'Krzysztof Kaczmarski'],
            'date': u'20110104'
        };
        self._run_case(pdf_file, expected_result)
    def testTwoAuthors(self):
        pdf_file = 'testcases/two_authors.pdf'
        expected_result = {
            'title': u'Accelerating SQL Database Operations on a GPU with CUDA',
            'authors': [u'Peter Bakkum', u'Kevin Skadron'],
            'date':u'20100305'
        };
        self._run_case(pdf_file, expected_result)
    def testCommaSeparated(self):
        pdf_file = 'testcases/comma_separated.pdf'
        expected_result = {
            'title': u'Architecture of a Database System',
            # TO-DO: add u'Michael Stonebraker', u'James Hamilton'
            'authors': [u'Joseph M. Hellerstein'],
            'date': u'20071113'
        };
        self._run_case(pdf_file, expected_result)
    def testThreeColumns(self):
        '''
        TO-DO: there are actually more than three authors, i.e., 
        this test can be more tough.
        '''
        pdf_file = 'testcases/three_columns.pdf'
        expected_result = {
            'title': u'H-Store: A High-Performance, Distributed Main Memory ' + 
                     u'Transaction Processing System',
                    #TO-DO: add u'Evan P. C. Jones', u'John Hugg' and more 
                     'authors': [u'Robert Kallman'],
                     'date':u'20081022'
        };
        self._run_case(pdf_file, expected_result)
    def testTwoLines(self):
        pdf_file = 'testcases/two_lines.pdf'
        expected_result = {
                'title': u'A Demonstration of SciDB: A Science-Oriented DBMS',
            'authors': [# the first line of author names
                        u'P. Cudre-Mauroux',
                        u'H. Kimura',
                        u'K.-T. Lim',
                        u'J. Rogers',
                        u'R. Simakov',
                        u'E. Soroush',
                        u'P. Velikhov',
                        u'D. L. Wang'
                        # TO-DO: add the second line
                        ],
            'date':u'20090626'
        };
        self._run_case(pdf_file, expected_result)
    def _run_case(self, pdf_file, expected_result):
        print '\nProcessing pdf "' + pdf_file + '"'
        p = subprocess.Popen("../pdf2json " + pdf_file, 
                             stdout=subprocess.PIPE, shell=True)
        pdf_json = p.stdout.read()
        meta = PdfMeta(pdf_json)
        meta.process()
        print 'Metadata of pdf "' + pdf_file + '" is:'
        print meta.json()
        self.assertEquals(meta.json(), expected_result);

if __name__ == '__main__':
    unittest.main()
