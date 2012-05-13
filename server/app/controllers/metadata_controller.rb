class MetadataController < ApplicationController
  def index
        #result = User.first.list_all_metadatas params  # current_user
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
        result = User.first.list_recent_metadatas params
        render :json => result
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
        doc_text = %x[app/tools/pdf2json #{tmp_pdf_file}] 
        # save text
        tmp_text_file = [tmp_dir, "text.json"].join("/")
        File.open(tmp_text_file, 'wb') do |file|
            file.write(doc_text)
        end
        # extract meta
        doc_meta = %x[app/tools/json2meta #{tmp_text_file}]
        # add metadata id
        parsed_meta = ActiveSupport::JSON.decode doc_meta
        #json_response = {:file_name => uploaded_io.original_filena                   
        user = User.first #current_user
        @paper = Paper.find_by_docid hash
        if @paper == nil
            @paper = Paper.new(docid: hash,title: parsed_meta["title"],authors: parsed_meta["authors"].join(", "),date: Date.parse(parsed_meta["date"]),content: doc_text, abstract: "", publication: "", convert: 0)
                if !@paper.save!
                    respond_to do |format| 
                        format.html { head :no_content }
                        format.json { render :json => '{"error":"failed1"}' }
                     end
                    return 
                end
        end
        if user.has_metadata? :docid=> hash
            respond_to do |format| 
                        format.html { head :no_content }
                        format.json { render :json => '{"error":"failed2"}' }
            end
            return 
        else
          @metadata = Metadata.new(docid: hash,title: nil, publication: nil,authors: nil,date: nil, abstract:nil, paper_id: @paper.id)
        if @metadata.save
            flash[:success] = "Upload Success!"
            respond_to do |format| 
                format.html { head :no_content }
                format.json { 
                    response = { 
                        :id     => @metadata.id,
                        :docid  => @paper.docid, 
                        :title  => @paper.title, 
                        :author => @paper.author, 
                        :date   => @paper.date,
                        :created_at => @metadata.created_at
                    }
                    json = ActiveSupport::JSON.encode response
                    render :json => json
                }
            end
            # save PDF
            final_dir = Rails.root.join 'public','uploads',hash
            FileUtils.mv(tmp_dir, final_dir)
            # add collection 
            user.collect! @metadata
            # save png
            #%x[app/tools/pdf2png "#{tmp_pdf_file}" 150 "#{tmp_dir}"]
            Process.spawn 'app/tools/pdf2png', (final_dir.to_s + "/uploaded.pdf"), "150", final_dir.to_s
        else
            respond_to do |format| 
                format.html { head :no_content }
                format.json { render :json => '{"error":"failed3"}' }
            end
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
