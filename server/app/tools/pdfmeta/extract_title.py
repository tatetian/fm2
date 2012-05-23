#!/usr/bin/python
# encoding: utf8
'''
input: the JSON representation of PDF from stdin
output: the JSON representation of PDF with metadata added to stdout
'''
import sys
import json

def process(json_str):
  # load the json
  json_object = json.loads(json_str)
  if not json_object.has_key('pages') or len(json_object['pages']) == 0:
    return json_object
  # assume the title is on the first page
  first_page = json_object['pages'][0]
  blocks = first_page['blocks']
  try:
    # assume the title is the lines with largest font
    bi, li, size = _find_largest_font_pos(blocks)
    # extract the string
    title = _extract_lines(blocks, bi, li, size)
  except:
    title = None
  # set title
  if title != None:
    json_object['title'] = title
  else:
    json_object['title'] = ""
  return json_object

def _find_largest_font_pos(blocks):
  max_bi = -1     # block index of max font
  max_li = -1     # line index of max font
  max_size = -1   # size of maximim
  for bi, b in enumerate(blocks):
    lines = b['lines']
    for li, l in enumerate(lines):
        if len(l['fs']) == 0:
          continue
        size = l['fs'][0]
        if max_size < size:
            max_bi = bi
            max_li = li
            max_size = size
  return max_bi, max_li, max_size
def _extract_lines(blocks, bi, li, max_size):
  if bi < 0 or li < 0:
    return None
  # assume title is in a block
  b = blocks[bi]
  title = ' '.join(b['lines'][li]['s'])
  lines = b['lines'][li+1:]
  for l in lines:
    if len(l['fs']) == 0 or l['fs'][0] != max_size:
      break
    # append the title
    title += ' '
    title += ' '.join(l['s'])
  title = ' '.join(title.split())
  return title

if __name__ == '__main__':
  json_str    = sys.stdin.read()        # input
  json_object = process(json_str)       # extract title from json
  print json.dumps(json_object)  # output
