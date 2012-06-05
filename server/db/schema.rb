# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120515091143) do

  create_table "collections", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "metadata_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "comments", :force => true do |t|
    t.integer  "user_id"
    t.integer  "paper_id"
    t.text     "content"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "logs", :force => true do |t|
    t.integer  "user_id"
    t.integer  "from_id"
    t.text     "content"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "metadata", :force => true do |t|
    t.string   "docid"
    t.string   "title"
    t.string   "authors"
    t.string   "publication"
    t.date     "date"
    t.string   "abstract"
    t.integer  "paper_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "notes", :force => true do |t|
    t.integer  "user_id"
    t.integer  "paper_id"
    t.integer  "pagenum"
    t.string   "posfrom"
    t.string   "posto"
    t.text     "content"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "papers", :force => true do |t|
    t.string   "docid"
    t.string   "title"
    t.string   "authors"
    t.string   "publication"
    t.date     "date"
    t.string   "abstract"
    t.text     "content"
    t.integer  "convert"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "papers", ["docid"], :name => "index_papers_on_docid", :unique => true

  create_table "relationships", :force => true do |t|
    t.integer  "user1_id"
    t.integer  "user2_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "relationships", ["user1_id", "user2_id"], :name => "index_relationships_on_user1_id_and_user2_id", :unique => true
  add_index "relationships", ["user1_id"], :name => "index_relationships_on_user1_id"
  add_index "relationships", ["user2_id"], :name => "index_relationships_on_user2_id"

  create_table "tags", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "uid"
    t.string   "name"
    t.string   "email"
    t.string   "headurl"
    t.string   "remember_token"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  add_index "users", ["remember_token"], :name => "index_users_on_remember_token", :unique => true
  add_index "users", ["uid"], :name => "index_users_on_uid", :unique => true

end
