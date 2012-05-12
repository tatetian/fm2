class AddIndexToPapersDocid < ActiveRecord::Migration
  def change
      add_index :papers, :docid, unique: true
  end
end
