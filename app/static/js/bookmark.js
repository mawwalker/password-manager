var bookmark=window.localStorage;
            
        if(typeof(Storage)=="undefined")
        {
          //localStorage.sitename="本地书签";
          document.getElementById("saved").innerHTML="对不起，您的浏览器不支持 web 存储。";
        }
        else{
            if(bookmark.length==0){
                document.getElementById("saved").innerHTML="您还没有保存书签";
            }
            else {
                for (i=0;i<bookmark.length;i++){
                    data=JSON.parse(bookmark[i]);
                    url=data.pathname;
                    var tag= "<a href='"+url+"'>"+data.name+"</a></br>";
                    document.getElementById("saved").insertAdjacentHTML("beforeEnd",tag);          
                }
                //document.getElementById("saved").innerHTML=doc_string;
                 
                var tag="</br><input type='button' value='清除所有书签' onclick='delete_fun()' ></input>";
                document.getElementById("saved").insertAdjacentHTML("beforeEnd",tag);          
            }
           
        }
        
        function save_fun(id){
        var loop=0;      //用来判断是否重复保存书签
        var length= bookmark.length;
        id_sidebar=id.replace('m','');
        mark_name=document.getElementById(id_sidebar).innerHTML;
            var url={
             //url1:window.location.href,
             //protocol:window.location.protocol,
             //hostname:window.location.hostname,
             name:mark_name,
             pathname:window.location.pathname,
             anchor:id
            };
            for(i=0;i<length;i++){
                data=JSON.parse(bookmark[i]);
                re = new RegExp("/","g");     //全部替换/
                var Newstr = 'm'+data.pathname.replace(re, "");
                if(id==Newstr){
                    loop=1;           
                }
            }
            if(loop){
                alert("请勿重复保存书签");
            }
            else{
                var data=JSON.stringify(url);   //storage不能直接存储对象
                bookmark[length]=data;
            }
        }
        
        function delete_fun(){
            bookmark.clear();
            window.location.reload();
        }