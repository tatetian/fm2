# encoding: UTF-8
class MetadataController < ApplicationController
  def index
      result = current_user.list_recent_metadatas params
      render :json => result
  end

  def show 
      u = current_user       
      metadata_id = params[:id]
      if u.has_metadata? :metadata_id=>metadata_id
          sql = "SELECT `metadata`.`id`,IFNULL(metadata.title,papers.title) as title,IFNULL(metadata.authors,papers.authors) as authors ,IFNULL(metadata.date,papers.date) as date,metadata.docid,metadata.created_at,paper_id FROM `metadata`,papers where `metadata`.`paper_id`=papers.id and metadata.id="+metadata_id
          result = Metadata.find_by_sql(sql)
          result = result.map { |metadata| 
                     d = metadata.attributes
                     d[:tags] = metadata.tags.map { |t| t.name } 
                     d
                   }
          if result.length > 0
            render :json => result[0]
            return
          end
      render :json => {}
      end
    end
    
    def destroy
      u = current_user       
      metadata_id = params[:id]
      if u.has_metadata? :metadata_id=>metadata_id
          m = Metadata.find_by_id(metadata_id)
          result = m.delete 
          if m.destroyed?
            render :json => result
          else
            render :json => {}
          end
      else
        render :json => {}
      end
    end

    def update
      u = current_user       
      metadata_id = params[:id]
      if u.has_metadata? :metadata_id=>metadata_id
        metadata = Metadata.find_by_id metadata_id
        result = metadata.update_attributes(params[:metadata])
        render :json => result
      else
        render :json => {}
      end
    end

    def create
      # Save file into temp folder
      uploaded_io = params[:file]
      #   Make a temp dir
      require 'uuidtools'
      tmp_dir     = UUIDTools::UUID.timestamp_create.to_s + "-" + UUIDTools::UUID.random_create.to_s
      tmp_dir     = Rails.root.join 'public', 'uploads', 'tmp', tmp_dir
      Dir.mkdir   tmp_dir
      #   Save the uploaded file to temp dir
      tmp_file_name = [tmp_dir, "uploaded.pdf"].join("/")
      tmp_file    = File.open(tmp_file_name, 'wb')
      tmp_file.write(uploaded_io.read)
      tmp_file.close
      # Cal hash of doc
      hash = _doc_hash(tmp_file_name)         
      # Get current user
      user = current_user
      @paper = Paper.find_by_docid hash
      new_upload = false
      # If the paper has not uploaded to server before
      #   Paper is the unique representation for a paper uplaoded
      #   Metadata is a user's paper
      if @paper == nil
        new_upload = true
        # Get the metadata & text of file as JSON
        pdf2json = Rails.root.join 'app/tools/pdf2json'
        json_text = %x[#{pdf2json} #{tmp_file_name}] 
        # Save JSON into a file
        tmp_text_file = [tmp_dir, "text.json"].join("/")
        File.open(tmp_text_file, 'wb') do |file|
            file.write(json_text)
        end
        # Create a new paper record 
        parsed_meta = ActiveSupport::JSON.decode json_text
        @paper = Paper.new(
                    docid: hash,
                    title: parsed_meta["title"],
                    authors: "", #parsed_meta["authors"].join(", "),
                    date: nil, #Date.parse(parsed_meta["date"]),
                    content: json_text, 
                    abstract: "", publication: "", convert: 0)
        if !@paper.save!
            render :json => '{"error":"failed1"}'
            return 
        end
        # Move the tmp uploaded file to its permanent location
        #Dir.mkdir Rails.root.join 'public','uploads', hash[0..1] 
        final_dir = Rails.root.join 'public','uploads', hash#hash[0..1], hash[2..-1]
        FileUtils.mv(tmp_dir, final_dir)
        # Convert PDF to PNG
        pdf2png = Rails.root.join 'app/tools/pdf2png'
        Process.spawn pdf2png.to_s, (final_dir.to_s + "/uploaded.pdf"), "150", final_dir.to_s
      end
      # If the user has uploaded the same PDF before
      if user.has_metadata? :docid=> hash
        render :json => '{"error":"The same PDF have been uploaded by this user before"}'
        return 
      # Else this is the first time that the user uploads the file
      else
        @metadata = Metadata.new(docid: hash,
                                 title: nil, publication: nil, 
                                 authors: nil,date: nil, abstract:nil, 
                                 paper_id: @paper.id)
        if @metadata.save
          # If specified tag for the uploaded doc
          if params[:tag] != nil
            user.attach_tag @metadata.id, params[:tag]
          end
          # Attach the special '__all' tag to any paper uploaded
          user.attach_tag @metadata.id, '__all'
          response = { 
              :id     => @metadata.id,
              :docid  => @paper.docid, 
              :title  => @paper.title, 
              :authors => @paper.authors, 
              :date   => @paper.date,
              :created_at => @metadata.created_at,
              :new    => new_upload
          }
          json = ActiveSupport::JSON.encode response
          render :json => json
          # Add the metadata to the current user
          #   (or the current user collect this paper)
          user.collect! @metadata
          #log = {:content=>user.name+"上传了论文", :paper_id=> @metadata.paper_id}
          #user.add_log! log
        else
          render :json => '{"error":"failed3"}'
        end
      end
    end
  
    def text
      respond_to do |format| 
        format.html { head :no_content }
        format.json { 
          render :json => current_user.get_text(params)
        }
      end
    end
  private 
      def _doc_hash(f)
        # Use SHA-1 to calculate a hash for the file
        # e.g. "74e10ff37b568e76c5166ce8b0eddf2abfdcbac9"
        require 'digest/sha1'
        sha1 = Digest::SHA1.hexdigest(File.read(f)).to_s
        # Truncate SHA-1 to UUID
        #   SHA-1 is 160-bit, UUID is 128-bit
        #   So we want the first 32 HEX digits (128/4=32)
        #   Although this uuid is same as version 5 UUID in essence, 
        #   they are not equal.
        # e.g. "74e10ff37b568e76c5166ce8b0eddf2a"
        uuid = sha1[0...32]
        # Get bytes representation of uuid
        # e.g. "t\xE1\x0F\xF3{V\x8Ev\xC5\x16l\xE8\xB0\xED\xDF*"
        bytes = [uuid].pack("H*")
        # Encode the bytes of uuid in Base64 encoding for shorter representation
        # e.g. "dOEP83tWjnbFFmzosO3fKg=="
        require "base64"
        base64 = Base64.urlsafe_encode64(bytes)
        # Discard the trailing '==' 
        #   In base 64 encoding, the trailing '=' is padding
        #     '==' indicates that the last group contains only 1 bytes
        #     '=' indicates that the last group contains 2 bytes
        # e.g. "dOEP83tWjnbFFmzosO3fKg"
        res = base64[0...-2]
      end
end
