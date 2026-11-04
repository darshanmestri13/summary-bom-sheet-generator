(() => {
  const tileConfigUrl=new URL('Backend/tile-variants.json',new URL('.',document.currentScript.src));
  const headers=['Product type','Revenue Segment','Parent SKU Code','Parent Product Name','Characters Length (40 Characters)','Child SKU Code','Child Description','Characters Length (40 Characters)','Packing Dimensions (MM) (LXWXH)','Product Dimensions (MM) (LXWXH)','Gross Weight (KG)','Net Weight (KG)','SAP Code Parent','SAP Code Child','Plant','Conversion Factor'];
  const productCodes=new Map([['coffee table','MCFT'],['dining table','MDINE'],['side table','MST'],['study table','ST'],['metal bed','MTB']]);
  const defaultTileCodes=[['Amphora White','AMW'],['Alaska White','ALW'],['Antaliya Beige','AB'],['Breccia Natural','BRN'],['Colonial Black','COB'],['Fragment White','FW'],['Fossil Black','FOB'],['Golden Statuario','GLDST'],['Omani Grey','OMG'],['Portoro Black','PRTB'],['Simless White','SW'],['Versace Aloud','VA'],['Vibranium Brown','VRB'],['Volga Blue','VOB']];
  const tileCodes=new Map();
  const $=id=>document.getElementById(id),escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalized=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  let currentGroups=[],currentModel='',currentData=null,removedTileNames=new Set(),tileSignature='';

  async function loadTileVariants(){
    try{
      const response=await fetch(tileConfigUrl,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const entries=await response.json();if(!Array.isArray(entries))throw new Error('Invalid JSON array');
      const parsed=new Map();for(const entry of entries){const name=String(entry?.name??'').trim(),shortForm=String(entry?.shortForm??'').trim().toUpperCase().replace(/\s+/g,'');if(!name||!/^[A-Z0-9]+$/.test(shortForm))throw new Error('Each entry needs a name and an alphanumeric shortForm');if([...parsed.keys()].some(existing=>normalized(existing)===normalized(name)))throw new Error(`Duplicate tile name: ${name}`);if([...parsed.values()].includes(shortForm))throw new Error(`Duplicate tile short form: ${shortForm}`);parsed.set(name,shortForm);}
      if(!parsed.size)throw new Error('The tile variant file is empty');const signature=JSON.stringify([...parsed.entries()]);if(signature===tileSignature){if($('status').textContent.startsWith('Could not load Backend/'))$('status').textContent='';return false;}tileCodes.clear();for(const [name,shortForm] of parsed)tileCodes.set(name,shortForm);tileSignature=signature;if($('status').textContent.startsWith('Could not load Backend/'))$('status').textContent='';return true;
    }catch(error){if(!tileCodes.size){for(const [name,shortForm] of defaultTileCodes)tileCodes.set(name,shortForm);tileSignature=JSON.stringify([...tileCodes.entries()]);$('status').textContent='Could not load Backend/tile-variants.json. Check that the tile file contains valid JSON and reload the page.';}return false;}
  }

  function decodeXml(files,path){const source=files.get(path);if(!source)throw new Error(`Could not find ${path} in the Excel workbook.`);const document=new DOMParser().parseFromString(source,'application/xml');if(document.querySelector('parsererror'))throw new Error('An Excel worksheet could not be read.');return document;}
  async function unzip(buffer){
    const bytes=new Uint8Array(buffer),view=new DataView(buffer),decoder=new TextDecoder();let eocd=-1;
    for(let index=bytes.length-22;index>=Math.max(0,bytes.length-65558);index--)if(view.getUint32(index,true)===0x06054b50){eocd=index;break;}
    if(eocd<0)throw new Error('Choose a valid .xlsx workbook.');
    const count=view.getUint16(eocd+10,true),directory=view.getUint32(eocd+16,true),files=new Map();
    for(let item=0,offset=directory;item<count;item++){
      if(view.getUint32(offset,true)!==0x02014b50)throw new Error('Excel file directory is damaged.');
      const method=view.getUint16(offset+10,true),compressedLength=view.getUint32(offset+20,true),nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true),localOffset=view.getUint32(offset+42,true),name=decoder.decode(bytes.slice(offset+46,offset+46+nameLength));
      const localName=view.getUint16(localOffset+26,true),localExtra=view.getUint16(localOffset+28,true),start=localOffset+30+localName+localExtra,compressed=bytes.slice(start,start+compressedLength);let content;
      if(method===0)content=compressed;else if(method===8){if(!window.DecompressionStream)throw new Error('Use an up-to-date Chrome or Edge browser to read .xlsx files.');content=new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}else throw new Error('This Excel workbook uses an unsupported compression format.');
      files.set(name,decoder.decode(content));offset+=46+nameLength+extraLength+commentLength;
    }
    return files;
  }
  function columnIndex(reference){let value=0;for(const letter of reference.match(/^[A-Z]+/i)?.[0]||'')value=value*26+letter.toUpperCase().charCodeAt(0)-64;return value-1;}
  async function readWorkbook(buffer){
    const files=await unzip(buffer),book=decodeXml(files,'xl/workbook.xml'),relsXml=decodeXml(files,'xl/_rels/workbook.xml.rels'),sharedXml=files.has('xl/sharedStrings.xml')?decodeXml(files,'xl/sharedStrings.xml'):null;
    const shared=sharedXml?[...sharedXml.getElementsByTagName('si')].map(item=>[...item.getElementsByTagName('t')].map(t=>t.textContent).join('')):[];
    const rels=new Map([...relsXml.getElementsByTagName('Relationship')].map(item=>[item.getAttribute('Id'),item.getAttribute('Target')]));
    return [...book.getElementsByTagName('sheet')].map(sheet=>{
      let path=rels.get(sheet.getAttribute('r:id'));if(!path)throw new Error(`Could not open worksheet ${sheet.getAttribute('name')}.`);path=path.startsWith('/')?path.slice(1):`xl/${path.replace(/^\.\//,'')}`;
      const doc=decodeXml(files,path),rows=[];
      for(const row of doc.getElementsByTagName('row')){const cells=[];for(const cell of row.children){if(cell.localName!=='c')continue;const index=columnIndex(cell.getAttribute('r'));let value='';if(cell.getAttribute('t')==='inlineStr')value=[...cell.getElementsByTagName('t')].map(t=>t.textContent).join('');else{const raw=cell.getElementsByTagName('v')[0]?.textContent||'';value=cell.getAttribute('t')==='s'?(shared[Number(raw)]||''):raw;}cells[index]=value;}rows.push(cells.map(value=>value??''));}
      return rows;
    });
  }
  function fieldValue(rows,pattern){
    for(let r=0;r<rows.length;r++)for(let c=0;c<(rows[r]||[]).length;c++){
      const text=String(rows[r][c]??'').trim(),label=text.split(':',1)[0].trim();if(!text||(!pattern.test(text)&&!pattern.test(label)))continue;
      const explicit=text.match(/^[^:]+:\s*(.+)$/);if(explicit?.[1])return explicit[1].trim();
      for(let y=r+1;y<rows.length;y++)if(String(rows[y]?.[c]??'').trim())return String(rows[y][c]).trim();
      for(let x=c+1;x<(rows[r]||[]).length;x++){const candidate=String(rows[r][x]??'').trim();if(candidate&&!/^(?:model name|product type|size|packing dimensions|packaging dimensions|product dimensions|gross weight|net weight|tile name|tile short form|plant|revenue segment|child count|number of boxes)\b/i.test(candidate))return candidate;}
    }
    return '';
  }
  function labeledValues(rows,pattern){
    for(let r=0;r<rows.length;r++)for(let c=0;c<(rows[r]||[]).length;c++){
      const label=String(rows[r][c]??'').trim(),labelOnly=label.split(':',1)[0].trim();if(!label||(!pattern.test(label)&&!pattern.test(labelOnly)))continue;
      const explicit=label.match(/^[^:]+:\s*(.+)$/);if(explicit?.[1])return explicit[1].trim();
      for(let y=r+1;y<rows.length;y++)if(String(rows[y]?.[c]??'').trim())return String(rows[y][c]).trim();
      for(let x=c+1;x<(rows[r]||[]).length;x++){const candidate=String(rows[r][x]??'').trim();if(/\d\s*[x×*]\s*\d/i.test(candidate))return candidate;}
    }
    return '';
  }
  function extractData(sheets){
    const rows=sheets.flat();
    const model=fieldValue(rows,/^model name$/i),productType=fieldValue(rows,/^product type$/i),rawSize=fieldValue(rows,/^size$/i),sizeMatch=rawSize.match(/\b(big|small|combo)\b/i),size=sizeMatch?sizeMatch[1][0].toUpperCase()+sizeMatch[1].slice(1).toLowerCase():'';
    const typeCode=productCodes.get(normalized(productType));if(!model)throw new Error('Model Name is missing from the workbook.');if(!typeCode)throw new Error('Add a supported Product Type: Coffee Table, Dining Table, Side Table, Study Table or Metal Bed.');if(!rawSize||(/\b(null|none|blank)\b/i.test(rawSize))){}else if(!size)throw new Error('Size must be Big, Small, Combo, or blank.');
    const packingText=labeledValues(rows,/^(?:packing|packaging)\s+dimensions?$/i),packing=packingText.split(/[,;|\n]+/).map(value=>value.trim()).filter(Boolean),productDimensions=labeledValues(rows,/^product\s+dimensions?$/i),grossWeight=fieldValue(rows,/^gross\s+weight(?:\s*\([^)]*\))?$/i),netWeight=fieldValue(rows,/^net\s+weight(?:\s*\([^)]*\))?$/i);
    if(!packing.length)throw new Error('Packing Dimension is missing. Add one LXWXH dimension for each child box, separated by commas.');if(!productDimensions)throw new Error('Product Dimension is missing.');
    return {model,productType,typeCode,size,sizeCode:size==='Big'?'B':size==='Small'?'S':size==='Combo'?'C':'',packing,productDimensions,grossWeight,netWeight,tiles:[...tileCodes.entries()]};
  }
  function makeGroups(data,variants=[...tileCodes.entries()]){
    const code=value=>String(value??'').toUpperCase().replace(/\s+/g,''),groups=[];
    for(const [tileName,tileShort] of variants){
      const parentCode=`W${data.typeCode}${code(data.model)}${data.sizeCode}${code(tileShort)}`,sizeLabel=data.size?` ${data.size}`:'',parentName=`${data.model}${sizeLabel} ${data.productType}-${tileName}`.slice(0,40),boxCount=data.packing.length;
      const childRows=data.packing.map((packing,index)=>{const tileBox=index===0,childSkuBase=tileBox?parentCode:`W${data.typeCode}${code(data.model)}${data.sizeCode}`,component=tileBox?'T':'F',singleBox=boxCount===1,childSku=singleBox?parentCode:`${childSkuBase}-B-${index+1}-${boxCount}-${component}`,childDescription=(singleBox?`${data.model}${sizeLabel} ${data.productType}-${code(tileShort)}`:`${data.model}${sizeLabel} ${data.productType}-${tileBox?`${code(tileShort)}-`:''}B-${index+1}-${boxCount}-${component}`).slice(0,40);return [data.productType,'Fabrication (MKA7)',parentCode,parentName,String(parentName.length),childSku,childDescription,String(childDescription.length),packing,data.productDimensions,data.grossWeight,data.netWeight,'','','MKA7',(1/boxCount).toFixed(2)];});
      groups.push({name:tileName,rows:childRows});
    }
    return groups;
  }
  function allRows(groups){const rows=[];groups.forEach((group,index)=>{rows.push(...group.rows);if(index<groups.length-1)rows.push(null);});return rows;}
  function render(data,groups){
    $('head').innerHTML=headers.map(value=>`<th>${escapeHtml(value)}</th>`).join('');
    $('rows').innerHTML=groups.length?allRows(groups).map(row=>row?`<tr>${row.map(value=>`<td>${escapeHtml(value)}</td>`).join('')}</tr>`:'<tr class="group-gap"><td colspan="16"></td></tr>').join(''):'<tr><td colspan="16">All tile variants were removed. Upload the workbook again to start over.</td></tr>';
    $('tileVariants').innerHTML=groups.map((group,index)=>`<div class="variant-row"><span>${escapeHtml(group.name)}</span><button class="remove-variant" type="button" data-remove-tile="${index}" aria-label="Remove ${escapeHtml(group.name)} tile variant">Delete</button></div>`).join('');
    const boxes=groups[0]?.rows.length||0,tiles=groups.map(group=>group.name).join(', ');
    $('summary').innerHTML=[['Model Name',data.model],['Product Type',data.productType],['Size',data.size||'Blank'],['Tile variants',tiles],['Child SKUs per parent',String(boxes)],['Packing dimensions',data.packing.join(' / ')],['Product dimensions',data.productDimensions]].map(([label,value])=>`<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');$('download').classList.add('visible');
    $('download').disabled=!groups.length;$('resultCaption').textContent=groups.length?`Created ${groups.length} parent product${groups.length===1?'':'s'} and ${groups.reduce((sum,group)=>sum+group.rows.length,0)} child SKU rows.`:'No tile variants selected.';$('result').classList.add('visible');
  }
  function xmlEscape(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function colName(index){let number=index+1,label='';while(number){const rem=(number-1)%26;label=String.fromCharCode(65+rem)+label;number=Math.floor((number-1)/26);}return label;}
  function buildWorkbook(groups){
    const rows=[headers,...allRows(groups)],widths=[20,24,28,40,20,36,40,20,30,30,18,18,20,20,14,18],cols=widths.map((width,index)=>`<col min="${index+1}" max="${index+1}" width="${width}" customWidth="1"/>`).join(''),merges=[];let sheetRow=2;
    for(const group of groups){const first=sheetRow,last=sheetRow+group.rows.length-1;if(last>first)merges.push(`<mergeCell ref="J${first}:J${last}"/>`);sheetRow=last+2;}
    const mergeXml=merges.length?`<mergeCells count="${merges.length}">${merges.join('')}</mergeCells>`:'';
    const body=rows.map((row,index)=>{const rowNumber=index+1;if(!row)return `<row r="${rowNumber}"/>`;const cells=row.map((value,col)=>{const ref=`${colName(col)}${rowNumber}`,style=index===0?' s="1"':col===15?' s="2"':'';if(index>0&&(col===4||col===7)){const formulaColumn=col===4?'D':'G';const cached=String(row[col]??'').replace(/[^0-9]/g,'');return `<c r="${ref}"${style}><f>LEN(${formulaColumn}${rowNumber})</f><v>${cached}</v></c>`;}if(index>0&&[10,11,15].includes(col)&&value!==''&&Number.isFinite(Number(value)))return `<c r="${ref}"${style}><v>${Number(value)}</v></c>`;if(col===9&&index>0&&merges.some(range=>{const match=range.match(/J(\d+):J(\d+)/);return match&&rowNumber>Number(match[1])&&rowNumber<=Number(match[2]);}))return '';return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;}).join('');return `<row r="${rowNumber}">${cells}</row>`;}).join('');
    const files={
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary BOM Sheet" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.00"/></numFmts><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:P${rows.length}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="19"/><cols>${cols}</cols><sheetData>${body}</sheetData>${mergeXml}<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>`
    };
    const encoder=new TextEncoder(),u16=(view,offset,value)=>view.setUint16(offset,value,true),u32=(view,offset,value)=>view.setUint32(offset,value>>>0,true),crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
    const localParts=[],centralParts=[];let offset=0;
    for(const [path,content] of Object.entries(files)){const name=encoder.encode(path),data=encoder.encode(content),crc=crc32(data),local=new Uint8Array(30+name.length+data.length),localView=new DataView(local.buffer);u32(localView,0,0x04034b50);u16(localView,4,20);u16(localView,6,0);u16(localView,8,0);u16(localView,10,0);u16(localView,12,33);u32(localView,14,crc);u32(localView,18,data.length);u32(localView,22,data.length);u16(localView,26,name.length);u16(localView,28,0);local.set(name,30);local.set(data,30+name.length);localParts.push(local);const central=new Uint8Array(46+name.length),centralView=new DataView(central.buffer);u32(centralView,0,0x02014b50);u16(centralView,4,20);u16(centralView,6,20);u16(centralView,8,0);u16(centralView,10,0);u16(centralView,12,0);u16(centralView,14,33);u32(centralView,16,crc);u32(centralView,20,data.length);u32(centralView,24,data.length);u16(centralView,28,name.length);u16(centralView,30,0);u16(centralView,32,0);u16(centralView,34,0);u16(centralView,36,0);u32(centralView,38,0);u32(centralView,42,offset);central.set(name,46);centralParts.push(central);offset+=local.length;}
    const centralSize=centralParts.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),endView=new DataView(end.buffer);u32(endView,0,0x06054b50);u16(endView,4,0);u16(endView,6,0);u16(endView,8,centralParts.length);u16(endView,10,centralParts.length);u32(endView,12,centralSize);u32(endView,16,offset);u16(endView,20,0);
    return new Blob([...localParts,...centralParts,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function download(event){if(!event?.isTrusted||event.currentTarget!==$('download')||!currentGroups.length)return;const url=URL.createObjectURL(buildWorkbook(currentGroups)),anchor=document.createElement('a');anchor.href=url;anchor.download=`Summary BOM Sheet - ${currentModel.replace(/[\\/:*?"<>|]/g,'_')}.xlsx`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
  async function processFile(file){
    const status=$('status');$('result').classList.remove('visible');status.classList.remove('error');status.textContent='Reading the Excel workbook…';
    try{const data=extractData(await readWorkbook(await file.arrayBuffer()));currentModel=data.model;currentData=data;removedTileNames.clear();currentGroups=makeGroups(data);render(data,currentGroups);status.textContent='';}
    catch(error){currentGroups=[];status.classList.add('error');status.textContent=error?.message||'Unable to process this workbook.';}
  }
  async function initialize(){
    await loadTileVariants();
    $('bomFile').addEventListener('change',event=>{const file=event.target.files?.[0];if(file)processFile(file);});$('download').addEventListener('click',download);
    $('tileVariants').addEventListener('click',event=>{const button=event.target.closest('[data-remove-tile]');if(!button||!currentData)return;const [removed]=currentGroups.splice(Number(button.dataset.removeTile),1);if(removed)removedTileNames.add(removed.name);render(currentData,currentGroups);});
    window.setInterval(async()=>{const changed=await loadTileVariants();if(changed&&currentData){currentGroups=makeGroups(currentData).filter(group=>!removedTileNames.has(group.name));render(currentData,currentGroups);}},1500);
  }
  initialize();
})();

