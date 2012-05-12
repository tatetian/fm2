# encoding: utf8
'''
input: the JSON representation of PDF from stdin
output: the JSON representation of PDF with metadata added to stdout
'''
import sys
import pdfmeta
if __name__ == '__main__':
    json = sys.stdin.read()         # input
    meta = pdfmeta.PdfMeta(json)    # PdfMeta object
    meta.process()                  # extract meta
    print meta                      # output json with metadata
