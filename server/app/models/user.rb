# encoding: UTF-8
class User < ActiveRecord::Base
  attr_accessible :email, :headurl, :name, :remember_token, :uid
  has_many :tags, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :notes, dependent: :destroy
  has_many :highlights, dependent: :destroy
  has_many :logs, dependent: :destroy

  has_many :relationships, foreign_key: "user1_id", dependent: :destroy
  has_many :friends, through: :relationships, source: :user2

  has_many :reverse_relationships, foreign_key: "user2_id",
                                   class_name:  "Relationship",
                                   dependent:   :destroy
  has_many :haoyous, through: :reverse_relationships, source: :user1
  
  
  #after_save { |user|
    # create a default tag for every user
    # All tags will be tagged as All
  #  Tag.create :name => "All", :user_id =>  user.id
  #}


  validates :name, presence: true, length: { maximum: 50 }
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  #validates :email, format:     { with: VALID_EMAIL_REGEX }
  def add_log! (params={})
    content  = params[:content]
    if params.has_key? (:paper_id)
        paper_id = params[:paper_id]
        paper = Paper.find_by_id(paper_id)
        metadata = self.has_paper? paper
        if metadata != nil and metadata.title != nil and metadata.title != ""
            logs.create!(:from_id=>self.id, :content=>content+"《"+metadata.title+"》")
            friends.each do |f|
                m = f.has_paper? paper
                if m != nil and m.title != nil and m.title != ""
                    f.logs.create!(:from_id=>self.id, :content=>content+"《"+m.title+"》")
                else
                    f.logs.create!(:from_id=>self.id, :content=>content+"《"+paper.title+"》")
                end
            end
        else
            logs.create!(:from_id=>self.id, :content=>content+ "《"+paper.title+"》")
            friends.each do |f|
                m = f.has_paper? paper
                if m != nil and m.title != nil and m.title != ""
                    f.logs.create!(:from_id=>self.id, :content=>content+"《"+m.title+"》")
                else
                    f.logs.create!(:from_id=>self.id, :content=>content+"《"+paper.title+"》")
                end
            end
        end
    else
        logs.create!(:from_id=>self.id, :content=>content)
        friends.each do |f|
            f.logs.create!(:from_id=>self.id, :content=>content)
        end
    end
  end
  def has_paper? paper
      tag = tags.find_by_name("__all")
      tag.metadatas.each do |m|
            if m.paper.id == paper.id
                  return m
            end
      end
      nil
  end
  def papers
      tag = tags.find_by_name("__all")
      result = tag.metadatas.map{
                    |m|
                    d = m.paper
                    d
                }
  end
  def is_friend?(other_user_id)
    relationships.find_by_user2_id(other_user_id)
  end

  def add_friend!(other_user)
    relationships.create!(user2_id: other_user.id)
    other_user.relationships.create!(user2_id: self.id)
  end

  def del_friend!(other_user)
    relationships.find_by_user2_id(other_user.id).delete
    other_user.relationships.find_by_user2_id(self.id).delete
  end

  def collect!(metadata)
    tag = self.tags.find_by_name "__all"
    tag.collections.create!(metadata_id: metadata.id)
  end

  def list_recent_metadatas(params={})
    if params.has_key? (:tag)
        result = search_metadatas params
        result[:entries]
    else 
        result = list_all_metadatas params
        result[:entries]
    end
  end

  def list_all_metadatas(params={})
    params[:tag] = "__all"
    search_metadatas params 
  end
  
  def search_metadatas(params={})
    # find tag
    tag_name = params[:tag]
    tag = self.tags.find_by_name tag_name
    return { :total => 0, :entries => [] } if tag == nil
    # init variables
    start, limit, keywords = params[:start], params[:limit], params[:keywords]
    start ||= 0
    limit ||= 10
    keywords ||= ""
    
    sql="SELECT `metadata`.`id`,IFNULL(metadata.title,papers.title) as title,IFNULL(metadata.authors,papers.authors) as authors ,IFNULL(metadata.date,papers.date) as date,metadata.docid,metadata.created_at,metadata.paper_id FROM `metadata`,papers,`collections`,tags where  `metadata`.`id` = `collections`.`metadata_id` and `metadata`.`paper_id`=papers.id and tag_id=tags.id and tags.id ="+tag.id.to_s+" AND  (IFNULL(metadata.title,papers.title) LIKE ('%"+keywords+"%') OR IFNULL(metadata.authors,papers.authors) LIKE('%"+keywords+"%') ) order by metadata.created_at desc"
    @result=Metadata.find_by_sql(sql)#+" LIMIT "+start.to_s+","+(start+limit).to_s) 
    entries = 
      #tag.docs.offset(start)
      #        .limit(limit)
      #        .where("title LIKE '%#{keywords}%' OR "+
      #              "author LIKE '%#{keywords}%'")
      #        .select("docs.id,title,author,date,docid,docs.created_at")
      @result.map { |metadata| 
                      d = metadata.attributes
                      d[:tags] = metadata.tags.map { |t| t.name } 
                      d
              }
    # total
    total = Metadata.find_by_sql(sql).count
    # result
    { :total => total, :entries => entries }
  end
  
  def has_metadata?(params)
    if params.has_key?(:metadata_id)
      metadata_id = params[:metadata_id]
      if self.tags.find_by_name("__all").metadatas.find_by_id(metadata_id) != nil
        return true
      else
        return false
      end
    elsif params.has_key?(:docid)
      docid = params[:docid]
      if self.tags.find_by_name("__all").metadatas.find_by_docid(docid) != nil
        return true
      else
        return false
      end
    end
    false
  end

  def get_text(params)
    if params.has_key?(:metadata_id)
      metadata_id = params[:metadata_id]
      {
        :metadata_id   => metadata_id,
        :content  => self.tags.find_by_name("__all")
                              .metadatas.find_by_id(metadata_id).paper.content
      }
    elsif params.has_key?(:docid)
      docid = params[:docid]
      {
        :docid    => docid,
        :content  => paper.find_by_docid(docid).content
      }
    end
    nil
  end
  
  def list_all_tags
    self.tags.all.map do |t|
        { :name => t.name, :num => t.collections.count }
    end
  end
  
  def create_tag name
    new_tag = self.tags.create(:name=>name,:user_id=>self.id)
    { id: new_tag.id, name: new_tag.name } 
  end

  def delete_tag tag_id
    Tag.delete tag_id
    { id: tag_id }
  end

  def rename_tag tag_id, new_name
    tag = Tag.find_by_id tag_id
    tag.name= new_name
    if tag.save
      return { id: tag.id, name: tag.name }
    else
      return nil
    end
  end
  
  def attach_tag metadata_id, tag_name
    tag = self.tags.find_by_name tag_name
    # create a tag if not exists
    if tag == nil
      tag = create_tag tag_name
      #tag = Tag.find_by_id tag.id
    end
    # create a new collection
    collection = tag.collections.create :metadata_id => metadata_id 
    return nil if collection
    { :tag_id => collection.tag_id,
      :metadata_id => collection.metadata_id }
  end
  
  def detach_tag metadata_id, tag_name
    tag = self.tags.find_by_name tag_name
    return nil if tag == nil
    Collection.delete_all :tag_id => tag.id, :metadata_id => metadata_id
    { :tag_id => tag.id,
      :metadata_id => metadata_id }
  end

  def retach_tag metadata_id, tag_name, new_tag_name
    attach_tag metadata_id, new_tag_name if detach_tag metadata_id, tag_name
  end 
  
end
