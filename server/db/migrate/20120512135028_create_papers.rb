class CreatePapers < ActiveRecord::Migration
  def change
    create_table :papers do |t|
      t.string :docid
      t.string :title
      t.string :authors
      t.string :publication
      t.date :date
      t.string :abstract
      t.text :content
      t.int :convert

      t.timestamps
    end
  end
end
