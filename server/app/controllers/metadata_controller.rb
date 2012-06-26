# encoding: UTF-8
class MetadataController < ApplicationController
  def index
        #result = current_user.list_all_metadatas params  # current_user
        #respond_to do |format| 
        #    format.html { head :no_content }
        #    format.json { 
        #      response = {
        #          :result => result 
        #      }
        #      json = ActiveSupport::JSON.encode response
        #      render :json => json 
        #    }
        #end
        result = current_user.list_recent_metadatas params
        render :json => result
    end

    def show 
        u = current_user       
        metadata_id = params[:id]
        if u.has_metadata? :metadata_id=>metadata_id
            sql="SELECT `metadata`.`id`,IFNULL(metadata.title,papers.title) as title,IFNULL(metadata.authors,papers.authors) as authors ,IFNULL(metadata.date,papers.date) as date,metadata.docid,metadata.created_at,paper_id FROM `metadata`,papers where `metadata`.`paper_id`=papers.id and metadata.id="+metadata_id
            result=Metadata.find_by_sql(sql)
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
        # save file
        uploaded_io = params[:file]
        require 'uuidtools'
        tmp_dir     = UUIDTools::UUID.timestamp_create.to_s + "-" + UUIDTools::UUID.random_create.to_s
        tmp_dir     = Rails.root.join 'public', 'uploads', 'tmp', tmp_dir
        Dir.mkdir   tmp_dir
        tmp_pdf_file = [tmp_dir, "uploaded.pdf"].join("/")
        File.open(tmp_pdf_file, 'wb') do |file|
          file.write(uploaded_io.read)
        end
        # doc hash
        hash = _doc_hash(tmp_pdf_file)         
        # parse file
        pdf2json = Rails.root.join 'app/tools/pdf2json'
        doc_text = %x[#{pdf2json} #{tmp_pdf_file}] 
        # save text
        tmp_text_file = [tmp_dir, "text.json"].join("/")
        File.open(tmp_text_file, 'wb') do |file|
            file.write(doc_text)
        end
        # extract meta
        #doc_meta = %x[app/tools/json2meta #{tmp_text_file}]
        # add metadata id
        parsed_meta = ActiveSupport::JSON.decode doc_text
        #json_response = {:file_name => uploaded_io.original_filena                   
        user = current_user #current_user
        @paper = Paper.find_by_docid hash
        if @paper == nil
            @paper = Paper.new(
                        docid: hash,
                        title: parsed_meta["title"],
                        authors: "", #parsed_meta["authors"].join(", "),
                        date: nil, #Date.parse(parsed_meta["date"]),
                        content: doc_text, 
                        abstract: "", publication: "", convert: 0)
                if !@paper.save!
                    render :json => '{"error":"failed1"}'
                    return 
                end
        end
        if user.has_metadata? :docid=> hash
            render :json => '{"error":"failed2"}'
            return 
        else
          @metadata = Metadata.new(docid: hash,title: nil, publication: nil,authors: nil,date: nil, abstract:nil, paper_id: @paper.id)
          if @metadata.save
              # if specified tag for the uploaded doc
              if params[:tag] != nil
                user.attach_tag @metadata.id, params[:tag]
              end
              user.attach_tag @metadata.id, '__all'
              flash[:success] = "Upload Success!"
              response = { 
                  :id     => @metadata.id,
                  :docid  => @paper.docid, 
                  :title  => @paper.title, 
                  :authors => @paper.authors, 
                  :date   => @paper.date,
                  :created_at => @metadata.created_at
              }
              json = ActiveSupport::JSON.encode response
              render :json => json
              #redirect_to :controller => 'home', :action => 'index'
              # save PDF
              final_dir = Rails.root.join 'public','uploads',hash
              FileUtils.mv(tmp_dir, final_dir)
              # add collection 
              user.collect! @metadata
              log = {:content=>user.name+"上传了论文", :paper_id=> @metadata.paper_id}
              user.add_log! log
              # save png
              #%x[app/tools/pdf2png "#{tmp_pdf_file}" 150 "#{tmp_dir}"]
              pdf2png = Rails.root.join 'app/tools/pdf2png'
              Process.spawn pdf2png.to_s, (final_dir.to_s + "/uploaded.pdf"), "150", final_dir.to_s
          else
            render :json => '{"error":"failed3"}'
          end
          #userdoc.create();
          # database
          # Docs.save id, title, author, date
          # UserDoc doc_id, user_id
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
        require 'digest/sha1'
        Digest::SHA1.hexdigest(File.read(f)).to_s

        Random.rand(2**31-1).to_s
      end
end
