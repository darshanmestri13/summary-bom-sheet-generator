(() => {
  const tileConfigUrl=new URL('Backend/tile-variants.json',document.baseURI);
  const headers=['Product type','Revenue Segment','Parent SKU Code','Parent Product Name','Characters Length (40 Characters)','Child SKU Code','Child Description','Characters Length (40 Characters)','Packing Dimensions (MM) (LXWXH)','Product Dimensions (MM) (LXWXH)','Gross Weight (KG)','Net Weight (KG)','SAP Code Parent','SAP Code Child','Plant','Conversion Factor'];
  const hardwareHeaders=['Product Type','Hardware Material Code','Hardware Material Description','Character Length (40 Character Limit)','Plant Code','Base UOM','Base Qty','Alt BOM','Component Material Code','Component Material Description','Component Quantity','UOM','Final Consumption Plant','Product Owning Plant'];
  const inhouseHeaders=['Product Type','Inhouse Material Code','Inhouse Material Description','Character Length (40 Character Limit)','Plant','Base UOM','Base Qty','Alt BOM','Component Material Code','Component Material Description','Component Quantity / Nesting (Max. 3 decimals)','UOM','Final Consumption Plant','Product Owning Plant'];
  const childHeaders=['Child Material Code','Child Material Description','Plant','Alt BOM','Base Qty','Component Code','Component Material Description','Component Quantity (Max. 3 decimals)','UOM'];
  const productCodes=new Map([['coffee table','MCFT'],['dining table','MDINE'],['side table','MST'],['study table','ST'],['metal bed','MTB']]);
  const tileSlabMappings={
    '1800x1200':{
      AMW:['3000002128','Amphora White Tile Slab 1800x1200x15mm'],ALW:['3000001855','Alaska White Tile Slab 1800x1200x15mm'],AB:['3000002625','Antaliya Beige Tile Slab 1800x1200x15mm'],BRN:['3007014088','Breccia Natural Tile Slab 1800X1200X15mm'],COB:['3000001857','Colonial Black Tile Slab 1800x1200x15mm'],FW:['3000001861','Fragment White Tile Slab 1800x1200x15mm'],FOB:['3007013823','Fossil Black Tile Slab 1800X1200X15mm'],GLDST:['3007013824','Golden Statuario Tile Slab 1800X1200X15mm'],OMG:['3007014529','Omani Grey Tile Slab 1800X1200X15mm'],PRTB:['3000002126','Portoro Black Tile Slab 1800X1200X15mm'],SW:['3000002631','Simless White Tile Slab 1800x1200x15mm'],VA:['3007013826','Versace Aloud Tile Slab 1800X1200X15mm'],VRB:['3000002130','Vibranium Brown Tile Slab 1800x1200x15mm'],VOB:['3007013827','Volga Blue Tile Slab 1800X1200X15mm']
    },
    '2400x1200':{
      AMW:['3007011229','Amphora White Tile Slab 2400x1200x15mm'],ALW:['3007011485','Alaska White Tile Slab 2400x1200x15mm'],AB:['3000002768','Antaliya Beige Tile Slab 2400x1200x15mm'],BRN:['3000002962','Breccia Natural Tile Slab 2400x1200x15mm'],COB:['3007011227','Colonial Black Tile Slab 2400x1200x15mm'],FW:['3007011224','Fragment White Tile Slab 2400x1200x15mm'],FOB:['3000002958','Fossil Black Tile Slab 2400x1200x15mm'],GLDST:['3000002960','Golden Statuario Tile Slab 2400x1200x15mm'],JC:['3000002964','Jerico Crema Tile Slab 2400x1200x15mm'],OMG:['3007011225','Omani Grey Tile Slab 2400x1200x15mm'],PRTB:['3000003618','Portoro Black Tile Slab 2400x1200x15mm'],SL:['3000002965','Saint Laurent Tile Slab 2400x1200x15mm'],SW:['3000002771','Simless White Tile Slab 2400x1200x15mm'],VA:['3000002772','Versace Aloud Tile Slab 2400x1200x15mm'],VRB:['3007011230','Vibranium Brown Tile Slab 2400x1200x15mm'],VOB:['3000002957','Volga Blue Tile Slab 2400x1200x15mm']
    }
  };
  const tileSlabUoms={
    '1800x1200':{AMW:'FT2',ALW:'FT2',AB:'FT2',BRN:'FT2',COB:'FT2',FW:'FT2',FOB:'N',GLDST:'N',OMG:'FT2',PRTB:'FT2',SW:'FT2',VA:'N',VRB:'FT2',VOB:'N'},
    '2400x1200':{AMW:'FT2',ALW:'N',AB:'FT2',BRN:'FT2',COB:'N',FW:'N',FOB:'FT2',GLDST:'FT2',JC:'FT2',OMG:'FT2',PRTB:'FT2',SL:'FT2',SW:'FT2',VA:'FT2',VRB:'FT2',VOB:'FT2'}
  };
  const tileUomByMaterialCode=new Map(Object.entries({
    '3007011229':'FT2','3007011485':'N','3000002768':'FT2','3000002962':'FT2','3007011227':'N','3007011224':'N','3000002958':'FT2','3000002960':'FT2','3000002964':'FT2','3007011225':'FT2','3000003618':'FT2','3000002965':'FT2','3000002771':'FT2','3000002772':'FT2','3007011230':'FT2','3000002957':'FT2',
    '3000002128':'FT2','3000001855':'FT2','3000002625':'FT2','3007014088':'FT2','3000001857':'FT2','3000001861':'FT2','3007013823':'N','3007013824':'N','3007014529':'FT2','3000002126':'FT2','3000002631':'FT2','3007013826':'N','3000002130':'FT2','3007013827':'N'
  }));
  // file:// pages cannot fetch a sibling JSON file in current browsers. Keep this
  // snapshot aligned with Backend/tile-variants.json for that offline preview mode.
  const localTileCodes=[['Amphora White','AMW'],['Alaska White','ALW'],['Antaliya Beige','AB'],['Breccia Natural','BRN'],['Colonial Black','COB'],['Fragment White','FW'],['Fossil Black','FOB'],['Golden Statuario','GLDST'],['Omani Grey','OMG'],['Portoro Black','PRTB'],['Simless White','SW'],['Versace Aloud','VA'],['Vibranium Brown','VRB'],['Volga Blue','VOB']];
  const tileCodes=new Map();
  const $=id=>document.getElementById(id),escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalized=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function formatComponentQuantity(value){const text=String(value??'').trim(),numeric=text.replace(/,/g,'');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(numeric))return text;const number=Number(numeric);return Number.isFinite(number)?String(Number(number.toFixed(3))):text;}
  let currentGroups=[],currentModel='',currentData=null,currentHardwareRows=[],currentInhouseGroups=[],currentChildRows=[],removedTileNames=new Set(),tileSignature='',tileLoadWarned=false;

  async function loadTileVariants(){
    try{
      const requestUrl=new URL(tileConfigUrl);requestUrl.searchParams.set('_',String(Date.now()));
      const response=await fetch(requestUrl,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const entries=await response.json();if(!Array.isArray(entries))throw new Error('Invalid JSON array');
      const parsed=new Map();for(const entry of entries){const name=String(entry?.name??'').trim(),shortForm=String(entry?.shortForm??'').trim().toUpperCase().replace(/\s+/g,'');if(!name||!/^[A-Z0-9]+$/.test(shortForm))throw new Error('Each entry needs a name and an alphanumeric shortForm');if([...parsed.keys()].some(existing=>normalized(existing)===normalized(name)))throw new Error(`Duplicate tile name: ${name}`);if([...parsed.values()].includes(shortForm))throw new Error(`Duplicate tile short form: ${shortForm}`);parsed.set(name,shortForm);}
      tileLoadWarned=false;
      if(!parsed.size)throw new Error('The tile variant file is empty');const signature=JSON.stringify([...parsed.entries()]);if(signature===tileSignature){if($('status').textContent.startsWith('Could not load Backend/')){$('status').textContent='';$('status').classList.remove('error');}return false;}tileCodes.clear();for(const [name,shortForm] of parsed)tileCodes.set(name,shortForm);tileSignature=signature;if($('status').textContent.startsWith('Could not load Backend/')){$('status').textContent='';$('status').classList.remove('error');}return true;
    }catch(error){
      if(location.protocol==='file:'&&!tileCodes.size){for(const [name,shortForm] of localTileCodes)tileCodes.set(name,shortForm);tileSignature=JSON.stringify([...tileCodes.entries()]);return true;}
      if(!tileCodes.size){$('status').classList.add('error');$('status').textContent='Could not load Backend/tile-variants.json. Check that it exists and contains valid JSON.';}
      if(!tileLoadWarned){console.warn('Tile catalog file could not be loaded.',error);tileLoadWarned=true;}
      return false;
    }
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
  function extractHardwareItems(sheets){
    const items=[];
    for(const rows of sheets){
      for(let headerRow=0;headerRow<rows.length;headerRow++){
        const labels=Array.from(rows[headerRow]||[],value=>normalized(value));
        const slIndex=labels.findIndex(value=>/^(?:sl no|serial no|serial number)$/.test(value));
        const partIndex=labels.findIndex(value=>/^(?:part number|part no|component material code)$/.test(value));
        const partNameIndex=labels.findIndex(value=>value==='part name'),nestingIndex=labels.findIndex(value=>value.startsWith('component quantity')||value==='nesting');
        const materialIndex=labels.findIndex(value=>value==='material'||value==='component material description');
        const qtyIndex=labels.findIndex(value=>/^(?:qty|quantity)$/.test(value));
        const uomIndex=labels.findIndex(value=>/^(?:uom|unit of measure)$/.test(value));
        if([slIndex,partIndex,materialIndex,qtyIndex,uomIndex].some(index=>index<0))continue;
        for(let rowIndex=headerRow+1;rowIndex<rows.length;rowIndex++){
          const row=rows[rowIndex]||[],serial=String(row[slIndex]??'').trim().toUpperCase();
          if(!/^[A-Z]$/.test(serial))continue;
          if(isChildBomItem({row:row.join(' ')}))continue;
          const partNumber=String(row[partIndex]??'').trim(),material=String(row[materialIndex]??'').trim(),quantity=String(row[qtyIndex]??'').trim(),uom=String(row[uomIndex]??'').trim();
          if(partNumber||material||quantity||uom)items.push({serial,partNumber,material,quantity,uom});
        }
        break;
      }
    }
    return items;
  }
  function extractInhouseItems(sheets){
    const items=[];
    for(const rows of sheets){
      for(let headerRow=0;headerRow<rows.length;headerRow++){
        const labels=Array.from(rows[headerRow]||[],value=>normalized(value));
        const slIndex=labels.findIndex(value=>/^(?:sl no|serial no|serial number)$/.test(value));
        const partNameIndex=labels.findIndex(value=>value==='part name'),partIndex=labels.findIndex(value=>/^(?:part number|part no|component material code)$/.test(value));
        const materialIndex=labels.findIndex(value=>value==='material'),descriptionIndex=labels.findIndex(value=>value==='description');
        const qtyIndex=labels.findIndex(value=>/^qty(?: quantity)?$/.test(value)),nestingIndex=labels.findIndex(value=>value.startsWith('component quantity')||value==='nesting');
        const uomIndex=labels.findIndex(value=>/^(?:uom|unit of measure)$/.test(value));
        if([slIndex,partNameIndex,partIndex,materialIndex,descriptionIndex,qtyIndex,nestingIndex,uomIndex].some(index=>index<0))continue;
        for(let rowIndex=headerRow+1;rowIndex<rows.length;rowIndex++){
          const row=rows[rowIndex]||[],serial=String(row[slIndex]??'').trim().toUpperCase();
          const item={serial,partName:String(row[partNameIndex]??'').trim(),partNumber:String(row[partIndex]??'').trim(),material:String(row[materialIndex]??'').trim(),description:String(row[descriptionIndex]??'').trim(),qty:String(row[qtyIndex]??'').trim(),nesting:String(row[nestingIndex]??'').trim(),uom:String(row[uomIndex]??'').trim()};
          const childBomTagged=Object.values(item).some(value=>/\bchild\s*bom\b/i.test(String(value??'')));
          if((!serial&&!childBomTagged)||/^(?:top assembly|leg assembly|assembly)$/i.test(item.partName))continue;
          if(Object.values(item).some(value=>value&&value!=='-'))items.push(item);
        }
        break;
      }
    }
    return items;
  }
  function extractMdfRows(sheets){
    const normalizeHeader=value=>normalized(value).replace(/\b40 character limit\b/g,'40 character limit');
    const normalizeMaterialCode=value=>{const code=String(value??'').trim().replace(/,/g,'');if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)[eE][+-]?\d+$/.test(code)){const numeric=Number(code);if(Number.isSafeInteger(numeric))return String(numeric);}return code.replace(/^(\d+)\.0+$/,'$1');};
    for(const rows of sheets){
      for(let headerRow=0;headerRow<rows.length;headerRow++){
        const labels=Array.from(rows[headerRow]||[],normalizeHeader);
        const indexes={productType:labels.findIndex(value=>value==='product type'),description:labels.findIndex(value=>value.startsWith('inhouse material description')),plant:labels.findIndex(value=>value==='plant'),uom:labels.findIndex(value=>value==='base uom'),baseQty:labels.findIndex(value=>value==='base qty'),altBom:labels.findIndex(value=>value==='alt bom'),code:labels.findIndex(value=>value==='component material code'),material:labels.findIndex(value=>value==='component material description'),quantity:labels.findIndex(value=>value.startsWith('component quantity')),componentUom:labels.findIndex(value=>value==='uom'),finalPlant:labels.findIndex(value=>value.startsWith('final consumption')),owningPlant:labels.findIndex(value=>value.startsWith('product owning plant'))};
        if([indexes.productType,indexes.description,indexes.plant,indexes.code,indexes.material].some(index=>index<0))continue;
        const extracted=[];
        for(let rowIndex=headerRow+1;rowIndex<rows.length;rowIndex++){
          const source=rows[rowIndex]||[],value=index=>index<0?'':String(source[index]??'').trim(),materialCode=normalizeMaterialCode(source[indexes.code]);
          const hasMainRowData=[indexes.productType,indexes.description,indexes.plant,indexes.code,indexes.material,indexes.quantity,indexes.componentUom].some(index=>value(index));
          if(!hasMainRowData)break;
          const row=[value(indexes.productType),'',value(indexes.description),String(value(indexes.description).length),value(indexes.plant),value(indexes.uom)||'N',value(indexes.baseQty)||'1',value(indexes.altBom)||'1',materialCode,value(indexes.material),formatComponentQuantity(value(indexes.quantity)),value(indexes.componentUom),value(indexes.finalPlant)||'MKA7',value(indexes.owningPlant)||'MKA7'];
          extracted.push(row);
        }
        return extracted;
      }
    }
    throw new Error('The MDF BOM workbook needs the Inhouse BOM columns, including Product Type, Inhouse Material Description, Component Material Code, and Component Material Description.');
  }
  function inhouseReserveCount(data){return data?.mdfRows?.length?data.mdfRows.length+1:7;}
  function extractData(sheets){
    if(!tileCodes.size)throw new Error('No tile variants are loaded. Check Backend/tile-variants.json and reload the page.');
    const rows=sheets.flat();
    const model=fieldValue(rows,/^model name$/i),productType=fieldValue(rows,/^product type$/i),rawSize=fieldValue(rows,/^size$/i),sizeMatch=rawSize.match(/\b(big|small|combo)\b/i),size=sizeMatch?sizeMatch[1][0].toUpperCase()+sizeMatch[1].slice(1).toLowerCase():'';
    const typeCode=productCodes.get(normalized(productType));if(!model)throw new Error('Model Name is missing from the workbook.');if(!typeCode)throw new Error('Add a supported Product Type: Coffee Table, Dining Table, Side Table, Study Table or Metal Bed.');if(!rawSize||(/\b(null|none|blank)\b/i.test(rawSize))){}else if(!size)throw new Error('Size must be Big, Small, Combo, or blank.');
    const packingText=labeledValues(rows,/^(?:packing|packaging)\s+dimensions?$/i),packing=packingText.split(/[,;|\n]+/).map(value=>value.trim()).filter(Boolean),productDimensions=labeledValues(rows,/^product\s+dimensions?$/i),grossWeight=fieldValue(rows,/^gross\s+weight(?:\s*\([^)]*\))?$/i),netWeight=fieldValue(rows,/^net\s+weight(?:\s*\([^)]*\))?$/i);
    if(!packing.length)throw new Error('Packing Dimension is missing. Add one LXWXH dimension for each child box, separated by commas.');if(!productDimensions)throw new Error('Product Dimension is missing.');
    const plant=fieldValue(rows,/^plant(?:\s+code)?$/i)||'MKA7';
    return {model,productType,typeCode,size,sizeCode:size==='Big'?'B':size==='Small'?'S':size==='Combo'?'C':'',packing,productDimensions,grossWeight,netWeight,plant,hardwareItems:extractHardwareItems(sheets),inhouseItems:extractInhouseItems(sheets),tiles:[...tileCodes.entries()]};
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
  function activeTileVariants(){return currentGroups.map(group=>[group.name,tileCodes.get(group.name)]).filter(([,shortForm])=>Boolean(shortForm));}
  function componentValues(item){
    if(!item)return {partNumber:'',material:'',quantity:'',uom:''};
    const isNumber=value=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(value??'').trim().replace(/,/g,''));
    const rawQuantity=item.quantity??item.qty??'';
    const quantity=isNumber(item.nesting)?item.nesting.trim():isNumber(rawQuantity)?String(rawQuantity).trim():'';
    let uom=String(item.uom??'').trim();if(!uom||/^(?:-|hardware bom|child bom)$/i.test(uom))uom=/nut/i.test(`${item.partName} ${item.material}`)?'N':'';
    return {partNumber:item.partNumber,material:item.material,quantity,uom};
  }
  function inhouseRow(data,description,component={},rowProductType=data.productType){
    const title=String(description??'').slice(0,40),values=componentValues(component);
    const plant=/corrugated box/i.test(`${description} ${component.partName??''} ${component.material??''} ${component.description??''}`)?'MTN2':'MKA7';
    const row=[rowProductType,'',title,String(title.length),plant,'N','1','1',values.partNumber,values.material,formatComponentQuantity(values.quantity),values.uom,'MKA7','MKA7'];
    if(component.formulaTarget)row.inhouseFormulaTarget=component.formulaTarget;
    return row;
  }
  function fitInhouseDescription(description,data){
    let title=String(description??'');
    if(title.length>40&&data.size==='Small')title=title.replace(/\bSmall\b/,'S');
    return title.slice(0,40);
  }
  function linkInhouseRow(data,description,componentDescription,rowProductType=data.productType,formulaTarget=''){
    return inhouseRow(data,description,{material:componentDescription,qty:'1',nesting:'1',uom:'N',formulaTarget},rowProductType);
  }
  function inhouseGroup(name,rows){return {name,rows};}
  function makeInhouseGroups(data,variants=[...tileCodes.entries()]){
    const items=data.inhouseItems||[],fields=item=>`${item.partName} ${item.material} ${item.description}`.toLowerCase();
    const tagged=items.map(item=>({item,text:fields(item),nesting:normalized(item.nesting)}));
    const inhouseTagged=tagged.filter(entry=>!isChildBomItem(entry.item));
    const isMdf=inhouseTagged.some(entry=>/\bmdf\b/i.test(entry.text));
    const nutEntries=inhouseTagged.filter(entry=>/\bnut\b/i.test(entry.text));
    const tileEntries=inhouseTagged.filter(entry=>{const sourceText=`${entry.item.partName} ${entry.item.material} ${entry.item.description}`;return /\btile\b/i.test(sourceText)&&(entry.item.partNumber||/\bslab\b|\b(?:1800|2400)\s*[x×]\s*1200\b/i.test(sourceText));}).sort((a,b)=>Number(/\bslab\b/i.test(b.text))-Number(/\bslab\b/i.test(a.text)));
    const tileSource=tileEntries[0]?.item;
    const tileSourceText=tileSource?`${tileSource.material} ${tileSource.description} ${tileSource.partName}`:'';
    const sheetSizeMatch=tileSourceText.match(/\b(1800|2400)\s*[x×]\s*1200(?:\s*[x×]\s*15(?:\.0+)?\s*mm?)?\b/i);
    const sheetSize=sheetSizeMatch?`${sheetSizeMatch[1]}x1200`:'';
    const sourceTileName=tileSource?[...tileCodes.keys()].sort((a,b)=>b.length-a.length).find(name=>normalized(`${tileSource.material} ${tileSource.description} ${tileSource.partName}`).includes(normalized(name))):'';
    const tileCutMatch=tileSource?.description.match(/(\d{3,4})\s*[x×]\s*(\d{3,4})/i),tileCutSize=tileCutMatch?`${tileCutMatch[1]}x${tileCutMatch[2]}`:'';
    const pasteEntries=inhouseTagged.filter(entry=>/araldite|pasting|adhesive/i.test(entry.text));
    const frameEntries=inhouseTagged.filter(entry=>/^2[ab]/i.test(entry.item.serial)||/\bleg\b|top plate/i.test(entry.item.partName));
    const powderEntries=inhouseTagged.filter(entry=>/^2[cd]/i.test(entry.item.serial)||/powder|\bdiesel\b|coating/i.test(entry.text));
    const excluded=new Set([...nutEntries,...tileEntries,...pasteEntries,...frameEntries,...powderEntries]);
    const genericEntries=inhouseTagged.filter(entry=>!excluded.has(entry)&&!/\bmdf\b/i.test(entry.text)&&!/hardware bom/i.test(entry.nesting)&&!/^[A-Z]$/.test(entry.item.serial));
    const packagingRelatedEntries=genericEntries.filter(entry=>/packag|plywood|plyboard|crate|corrugated|carton|stretch|bubble|foam|thermocol|epe|bopp|tape|ldpe|polyethylene|polythene|wrap|film|\bnails?\b|\bbox\b/i.test(entry.text));
    const packagingEntries=packagingRelatedEntries.filter(entry=>/plywood|plyboard|crate|corrugated/i.test(entry.text));
    const otherEntries=genericEntries.filter(entry=>!packagingRelatedEntries.includes(entry));
    const groups=[];
    data.inhouseMissingTileData=[];
    if(tileEntries.length){
      if(!sheetSize)data.inhouseMissingTileData.push('Tile slab size was not found; expected 1800x1200 or 2400x1200 in the uploaded tile material.');
      const sizeLabel=data.size?` ${data.size}`:'';
      const base=`${data.model}${sizeLabel} ${data.productType}`;
      const addTileVariant=(tileName,tileShort)=>{
        const slab=(sheetSize?tileSlabMappings[sheetSize]?.[tileShort]:null)||Object.values(tileSlabMappings).map(mapping=>mapping[tileShort]).find(Boolean)||null;
        const isSourceTile=sourceTileName&&normalized(sourceTileName)===normalized(tileName);
        const variantSource=tileEntries.find(entry=>normalized(`${entry.item.material} ${entry.item.description} ${entry.item.partName}`).includes(normalized(tileName)))?.item||(isSourceTile?tileSource:null);
        const tileQuantity=componentValues(variantSource);
        const partNumber=slab?.[0]||(isSourceTile?tileQuantity.partNumber:'');
        const productName=slab?.[1]||(isSourceTile?tileQuantity.material:'');
        const slabUom=tileUomByMaterialCode.get(String(partNumber??''))||(sheetSize?tileSlabUoms[sheetSize]?.[tileShort]||(variantSource?tileQuantity.uom:''):variantSource?tileQuantity.uom:'');
        const nestingSource=String(variantSource?.nesting??'').trim()?variantSource:tileSource;
        const rawNesting=String(nestingSource?.nesting??'').trim(),quantityParts=rawNesting.split('/').map(value=>value.trim()),sourceUoms=String(nestingSource?.uom??'').split('/').map(value=>value.trim().toUpperCase()),numericValue=value=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(value??'').replace(/,/g,''));
        let nestingQuantity='';
        if(quantityParts.length>1){let quantityIndex=sourceUoms.findIndex(value=>value===String(slabUom??'').toUpperCase());if(quantityIndex<0&&quantityParts.length===2)quantityIndex=String(slabUom??'').toUpperCase()==='FT2'?0:String(slabUom??'').toUpperCase()==='N'?1:-1;if(quantityIndex>=0&&quantityIndex<quantityParts.length&&numericValue(quantityParts[quantityIndex]))nestingQuantity=quantityParts[quantityIndex];}
        else if(numericValue(rawNesting))nestingQuantity=rawNesting;
        if(!partNumber||!productName)data.inhouseMissingTileData.push(`${tileName} (${tileShort}) has no ${sheetSize||'matching-size'} Tiles List product name or material code.`);
        if(!slabUom)data.inhouseMissingTileData.push(`${tileName} (${tileShort}) has no tile consumption UOM mapping for ${sheetSize||'the selected slab size'}.`);
        const tileDesc=fitInhouseDescription(`${base} Tile ${tileShort}${tileCutSize?`-${tileCutSize}`:''}`,data);
        const component={partNumber,material:productName,quantity:nestingQuantity,uom:slabUom||tileQuantity.uom};
        const tileRow=inhouseRow(data,tileDesc,component);tileRow[8]=String(partNumber??'').trim();tileRow[9]=productName;
        groups.push(inhouseGroup(tileDesc,[tileRow]));
        const topDesc=fitInhouseDescription(`${base} Tile Top-${tileShort}`,data);
        const mdfPlaceholder=inhouseRow(data,topDesc);
        mdfPlaceholder.fill('',8);
        if(data.mdfRows?.length){mdfPlaceholder[9]=data.mdfRows[0][2]||'';mdfPlaceholder[10]='1';mdfPlaceholder[11]='N';mdfPlaceholder[12]='MKA7';mdfPlaceholder[13]='MKA7';mdfPlaceholder.inhouseFormulaTarget='__MDF_BOM__';}
        const topRows=[linkInhouseRow(data,topDesc,tileDesc,data.productType,tileDesc),mdfPlaceholder];
        if(pasteEntries.length)topRows.push(...pasteEntries.map(entry=>inhouseRow(data,topDesc,entry.item)));
        groups.push(inhouseGroup(topDesc,topRows));
      };
      const sourceVariant=variants.find(([name])=>sourceTileName&&normalized(name)===normalized(sourceTileName));
      if(sourceVariant)addTileVariant(...sourceVariant);
      if(frameEntries.length){
        const frameDesc=`${data.model}${data.size?` ${data.size}`:''} ${data.productType} Leg Frame`.slice(0,40);
        groups.push(inhouseGroup(frameDesc,frameEntries.map(entry=>inhouseRow(data,frameDesc,entry.item))));
      }
      if(powderEntries.length){
        const frameDesc=`${data.model}${data.size?` ${data.size}`:''} ${data.productType} Leg Frame`.slice(0,40),powderDesc=`Pow${data.size?` ${data.size}`:''} ${data.model} ${data.productType} Leg Frame`.slice(0,40);
        groups.push(inhouseGroup(powderDesc,[linkInhouseRow(data,powderDesc,frameDesc,'Pow Metal Frame'),...powderEntries.map(entry=>inhouseRow(data,powderDesc,entry.item,'Pow Metal Frame'))]));
      }
      for(const entry of otherEntries){const desc=(entry.item.partName||entry.item.material||entry.item.description||`Component ${entry.item.serial}`).slice(0,40);groups.push(inhouseGroup(desc,[inhouseRow(data,desc,entry.item)]));}
      const plywoodEntries=packagingEntries.filter(entry=>/plywood|plyboard|crate/i.test(entry.text));
      const corrugatedEntries=packagingEntries.filter(entry=>/corrugated/i.test(entry.text));
      const componentRows=entries=>entries.map(entry=>{const desc=(entry.item.partName||entry.item.material||entry.item.description||`Component ${entry.item.serial}`).slice(0,40);return inhouseRow(data,desc,entry.item);});
      if(plywoodEntries.length)groups.push(inhouseGroup('Plywood Crate',componentRows(plywoodEntries)));
      const boxRows=componentRows(corrugatedEntries);
      if(boxRows.length)groups.push(inhouseGroup(corrugatedEntries.length?'Corrugated Box':'Packaging',boxRows));
      for(const variant of variants){if(sourceVariant&&variant===sourceVariant)continue;addTileVariant(...variant);}
      data.inhouseMissingTileData=[...new Set(data.inhouseMissingTileData)];
    }else{
      if(frameEntries.length){const frameDesc=`${data.model}${data.size?` ${data.size}`:''} ${data.productType} Leg Frame`.slice(0,40);groups.push(inhouseGroup(frameDesc,frameEntries.map(entry=>inhouseRow(data,frameDesc,entry.item))));}
      for(const entry of [...powderEntries,...otherEntries,...packagingEntries]){const desc=(entry.item.partName||entry.item.material||entry.item.description||`Component ${entry.item.serial}`).slice(0,40);groups.push(inhouseGroup(desc,[inhouseRow(data,desc,entry.item)]));}
    }
    data.inhouseHasMdf=true;
    return groups;
  }
  function allInhouseRows(groups,data){
    const reserveCount=inhouseReserveCount(data),rows=Array.from({length:reserveCount},(_,index)=>data?.mdfRows?.[index]||null);
    groups.forEach((group,index)=>{rows.push(...group.rows);if(index<groups.length-1)rows.push(null);});
    return rows;
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
  function renderHardware(data){
    const sizeLabel=data.size?' '+data.size:'',description=('Hardware '+data.model+sizeLabel+' '+data.productType).slice(0,40);
    currentHardwareRows=data.hardwareItems.map(item=>[data.productType,'',description,String(description.length),data.plant||'MKA7','N','1','1',item.partNumber,item.material,item.quantity,item.uom,'MKA7','MKA7']);
    $('hardwareHead').innerHTML=hardwareHeaders.map(value=>'<th>'+escapeHtml(value)+'</th>').join('');
    $('hardwareRows').innerHTML=currentHardwareRows.length?currentHardwareRows.map(row=>'<tr>'+row.map(value=>'<td>'+escapeHtml(value)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="14">No single-letter SL.NO hardware rows were found in the uploaded workbook.</td></tr>';
    $('hardwareCaption').textContent='Created '+currentHardwareRows.length+' hardware component row'+(currentHardwareRows.length===1?'':'s')+' from single-letter SL.NO entries.';
    $('hardwareDownload').classList.toggle('visible',currentHardwareRows.length>0);$('hardwareDownload').disabled=!currentHardwareRows.length;
    $('downloadAll').disabled=!currentData;
  }
  function renderInhouse(data,variants=activeTileVariants()){
    currentInhouseGroups=makeInhouseGroups(data,variants);
    $('inhouseHead').innerHTML=inhouseHeaders.map(value=>`<th>${escapeHtml(value)}</th>`).join('');
    const rows=allInhouseRows(currentInhouseGroups,data),reserveCount=inhouseReserveCount(data);
    $('inhouseRows').innerHTML=rows.length?rows.map((row,index)=>row?`<tr>${row.map(value=>`<td>${escapeHtml(value)}</td>`).join('')}</tr>`:index<reserveCount?'<tr class="mdf-reserved-row"><td colspan="14"></td></tr>':'<tr class="group-gap"><td colspan="14"></td></tr>').join(''):'<tr><td colspan="14">No inhouse component rows were found in the uploaded workbook.</td></tr>';
    const notices=[];
    if(data.mdfRows?.length)notices.push(`${data.mdfRows.length} MDF BOM component row${data.mdfRows.length===1?' is':'s are'} placed at the top of Inhouse BOM.`);
    else notices.push('Seven rows are reserved at the top for the MDF BOM.');
    if(data.inhouseMissingTileData?.length)notices.push(`Missing tile or pasting component details: ${data.inhouseMissingTileData.join(', ')}. Add the component values to the workbook before using this BOM.`);
    $('inhouseNotice').textContent=notices.join(' ');
    $('inhouseNotice').classList.toggle('warning',Boolean(data.inhouseMissingTileData?.length));
    $('inhouseCaption').textContent=`Generated ${currentInhouseGroups.reduce((sum,group)=>sum+group.rows.length,0)} inhouse component rows across ${currentInhouseGroups.length} material groups.`;
    $('inhouseDownload').classList.toggle('visible',currentInhouseGroups.length>0);$('inhouseDownload').disabled=!currentInhouseGroups.length;
  }
  function isChildBomItem(item){
    const content=Object.values(item||{}).join(' ');
    return /\bchild\s*bom\b/i.test(content)||normalized(content).includes('polypropylene leg bush');
  }
  function hasChildBomMarker(item){return Object.values(item||{}).some(value=>/\bchild\s*bom\b/i.test(String(value??'')));}
  function childBoxNumber(item){const match=String(item?.serial||'').match(/^B\s*(\d+)$/i);return match?Number(match[1]):0;}
  function childInhouseRowNumber(groupIndex,rowIndex){let row=2+inhouseReserveCount(currentData);for(let index=0;index<groupIndex;index++)row+=currentInhouseGroups[index].rows.length+1;return row+rowIndex;}
  function childInhouseRouteForItem(item){
    const partCode=String(item?.partNumber||'').trim(),material=normalized(item?.material||'');
    for(let groupIndex=0;groupIndex<currentInhouseGroups.length;groupIndex++)for(let rowIndex=0;rowIndex<currentInhouseGroups[groupIndex].rows.length;rowIndex++){
      const row=currentInhouseGroups[groupIndex].rows[rowIndex];
      if((partCode&&String(row[8]||'').trim()===partCode)||(!partCode&&material&&normalized(row[9])===material))return {description:row[2],row:childInhouseRowNumber(groupIndex,rowIndex)};
    }
    return null;
  }
  function childFindPackagingRoute(boxNumber,pattern){
    const candidates=(currentData?.inhouseItems||[]).filter(item=>pattern.test(`${item.partName} ${item.material} ${item.description}`)&&!/child\s*bom/i.test(`${item.partName} ${item.material} ${item.description}`));
    for(const item of [...candidates.filter(item=>childBoxNumber(item)===boxNumber),...candidates.filter(item=>childBoxNumber(item)!==boxNumber)]){
      const route=childInhouseRouteForItem(item);if(route)return route;
    }
    for(let groupIndex=0;groupIndex<currentInhouseGroups.length;groupIndex++)for(let rowIndex=0;rowIndex<currentInhouseGroups[groupIndex].rows.length;rowIndex++){
      const group=currentInhouseGroups[groupIndex],row=group.rows[rowIndex];
      if(pattern.test(`${group.name} ${row[2]} ${row[9]}`))return {description:row[2],row:childInhouseRowNumber(groupIndex,rowIndex)};
    }
    return null;
  }
  function childTileRoute(shortForm){
    const tileTopNeedle=normalized(`Tile Top ${shortForm}`);
    for(let groupIndex=0;groupIndex<currentInhouseGroups.length;groupIndex++){
      const group=currentInhouseGroups[groupIndex];if(normalized(group.name).includes(tileTopNeedle)&&group.rows[0])return {description:group.rows[0][2],row:childInhouseRowNumber(groupIndex,0)};
    }
    for(let groupIndex=0;groupIndex<currentInhouseGroups.length;groupIndex++){
      const group=currentInhouseGroups[groupIndex];if(normalized(group.name).includes(normalized(`Tile ${shortForm}`))&&group.rows[0])return {description:group.rows[0][2],row:childInhouseRowNumber(groupIndex,0)};
    }
    return null;
  }
  function childFrameRoute(){
    for(let groupIndex=0;groupIndex<currentInhouseGroups.length;groupIndex++){
      const group=currentInhouseGroups[groupIndex],rowIndex=group.rows.findIndex(row=>/^Pow\b/i.test(String(row[2]||''))&&/leg frame/i.test(String(row[2]||'')));
      if(rowIndex>=0)return {description:group.rows[rowIndex][2],row:childInhouseRowNumber(groupIndex,rowIndex)};
    }
    return null;
  }
  function childSourceDescription(item){
    const partName=String(item?.partName||'').replace(/^\s*child\s*bom\s*[:\-]?\s*/i,'').trim();
    return String(item?.material||item?.description||partName||'').trim();
  }
  function childSourceQuantity(item){
    const nesting=String(item?.nesting||'').trim(),text=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.test(nesting)?nesting:String(item?.qty||'').trim();
    const match=text.match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    return match?formatComponentQuantity(match[0]):'';
  }
  function childBoxItems(data,boxNumber){
    return (data.inhouseItems||[]).filter(item=>childBoxNumber(item)===boxNumber&&!isChildBomItem(item)&&!/corrugated|plywood|plyboard|crate/i.test(`${item.partName} ${item.material} ${item.description}`));
  }
  function childBomItems(data){
    const items=(data.inhouseItems||[]).filter(isChildBomItem),bushItems=items.filter(item=>normalized(Object.values(item||{}).join(' ')).includes('polypropylene leg bush'));
    const selectedBush=bushItems.find(item=>/^B\s*1$/i.test(String(item.serial||''))&&Boolean(childSourceQuantity(item)))||bushItems.find(item=>Boolean(childSourceQuantity(item)))||bushItems[0];
    return items.filter(item=>!normalized(Object.values(item||{}).join(' ')).includes('polypropylene leg bush')||item===selectedBush);
  }
  function childInitialTileGroupIndex(data){
    const tileSource=(data.inhouseItems||[]).find(item=>/\btile\b/i.test(`${item.partName} ${item.material} ${item.description}`)&&(/\bslab\b/i.test(`${item.partName} ${item.material} ${item.description}`)||item.partNumber));
    if(tileSource){
      const sourceText=normalized(`${tileSource.partName} ${tileSource.material} ${tileSource.description}`);
      const tileName=[...tileCodes.keys()].sort((a,b)=>b.length-a.length).find(name=>sourceText.includes(normalized(name)));
      if(tileName){const index=currentGroups.findIndex(group=>normalized(group.name)===normalized(tileName));if(index>=0)return index;}
    }
    return currentGroups.length?0:-1;
  }
  function buildChildRows(data){
    const output=[],notices=[],boxCount=Math.max(1,data.packing.length),markedItems=childBomItems(data),frameRoute=childFrameRoute(),hardwareRoute=currentHardwareRows.length?{description:currentHardwareRows[0][2],row:2}:null;
    const sourceHasData=item=>Boolean(item.partNumber||childSourceDescription(item)||childSourceQuantity(item)||item.uom);
    const selectedGroupIndex=childInitialTileGroupIndex(data),groupPlans=selectedGroupIndex<0?[]:[
      {group:currentGroups[selectedGroupIndex],groupIndex:selectedGroupIndex,boxIndexes:Array.from({length:boxCount},(_,index)=>index)},
      ...currentGroups.map((group,groupIndex)=>({group,groupIndex,boxIndexes:[0]})).filter(plan=>plan.groupIndex!==selectedGroupIndex)
    ];
    groupPlans.forEach(({group,groupIndex,boxIndexes},planIndex)=>{
      const shortForm=tileCodes.get(group.name)||'';
      boxIndexes.forEach((boxIndex,sectionIndex)=>{
        const boxNumber=boxIndex+1,summaryRow=2+currentGroups.slice(0,groupIndex).reduce((sum,previous)=>sum+previous.rows.length+1,0)+boxIndex,section=[];
        const addRoute=(route,source,label,quantity='1')=>{
          if(!route){notices.push(`${group.name}, Box ${boxNumber}: ${label} could not be routed from ${source}.`);return;}
          section.push({row:['',route.description,'MKA7','1','1','',route.description,quantity,'N'],formula:{6:source==='Hardware BOM'?`'Hardware BOM'!C${route.row}`:`'Inhouse BOM'!C${route.row}`}});
        };
        if(boxNumber===1){
          addRoute(childTileRoute(shortForm),'Inhouse BOM','Tile');
          addRoute(childFindPackagingRoute(boxNumber,/corrugated/i),'Inhouse BOM','Box 1');
          addRoute(childFindPackagingRoute(boxNumber,/plywood|plyboard|crate/i),'Inhouse BOM','Plywood Crate');
          if(hardwareRoute)addRoute(hardwareRoute,'Hardware BOM','Hardware Pack');else notices.push(`${group.name}, Box 1: Hardware Pack route is unavailable.`);
        }else{
          let frameQty='1';
          const frameItem=(data.inhouseItems||[]).find(item=>/^2A$/i.test(String(item.serial||''))&&/^\d+(?:\.0+)?$/.test(String(item.qty||'').trim()));
          if(frameItem)frameQty=String(Number(frameItem.qty));
          if(frameRoute)addRoute(frameRoute,'Inhouse BOM','Final Leg Frame',frameQty);else notices.push(`${group.name}, Box ${boxNumber}: Final Leg Frame route is unavailable.`);
          addRoute(childFindPackagingRoute(boxNumber,/corrugated/i),'Inhouse BOM',`Box ${boxNumber}`);
        }
        for(const item of childBoxItems(data,boxNumber))if(sourceHasData(item))section.push({row:['','','MKA7','1','1',item.partNumber||'',childSourceDescription(item),childSourceQuantity(item),String(item.uom||'').trim()]});
        if(boxNumber===1)for(const item of markedItems)if(sourceHasData(item))section.push({row:['','','MKA7','1','1',item.partNumber||'',childSourceDescription(item),childSourceQuantity(item),String(item.uom||'').trim()]});
        section.forEach((entry,index)=>{
          entry.row[1]=group.rows[boxIndex]?.[6]||'';
          entry.formula={...entry.formula,1:index===0?`'Summary BOM Sheet'!G${summaryRow}`:`B${output.length+1}`};
          output.push(entry);
        });
        if(sectionIndex<boxIndexes.length-1||planIndex<groupPlans.length-1)output.push(null);
      });
    });
    if(!markedItems.length)notices.push('No source components marked “Child BOM” were found in the uploaded workbook.');
    return {rows:output,notices:[...new Set(notices)]};
  }
  function renderChild(data){
    const result=buildChildRows(data);currentChildRows=result.rows;
    $('childHead').innerHTML=childHeaders.map(value=>`<th>${escapeHtml(value)}</th>`).join('');
    $('childRows').innerHTML=currentChildRows.length?currentChildRows.map(entry=>entry?`<tr>${entry.row.map(value=>`<td>${escapeHtml(value)}</td>`).join('')}</tr>`:'<tr class="group-gap"><td colspan="9"></td></tr>').join(''):'<tr><td colspan="9">No Child BOM rows are available.</td></tr>';
    $('childNotice').textContent=result.notices.join(' ');$('childNotice').classList.toggle('warning',result.notices.length>0);
    const sectionCount=currentChildRows.filter(Boolean).length?1+currentChildRows.filter(entry=>entry===null).length:0;
    $('childCaption').textContent=`Generated ${currentChildRows.filter(Boolean).length} rows across ${sectionCount} box section${sectionCount===1?'':'s'} for one tile variant.`;
    $('childDownload').classList.toggle('visible',currentChildRows.some(Boolean));$('childDownload').disabled=!currentChildRows.some(Boolean);
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
  function buildHardwareWorkbook(rows){
    const tableRows=[hardwareHeaders,...rows],widths=[20,24,40,24,16,14,12,12,24,38,18,14,24,24];
    const cols=widths.map((width,index)=>'<col min="'+(index+1)+'" max="'+(index+1)+'" width="'+width+'" customWidth="1"/>').join('');
    const body=tableRows.map((row,index)=>{
      const rowNumber=index+1;if(!row)return '<row r="'+rowNumber+'"/>';
      const cells=row.map((value,col)=>{
        const ref=colName(col)+rowNumber,style=index===0?' s="1"':'';
        if(index>0&&col===3)return '<c r="'+ref+'"'+style+'><f>LEN(C'+rowNumber+')</f><v>'+String(row[col]??'').replace(/[^0-9]/g,'')+'</v></c>';
        if(index>0&&[6,7,10].includes(col)&&value!==''&&Number.isFinite(Number(value)))return '<c r="'+ref+'"'+style+'><v>'+Number(value)+'</v></c>';
        return '<c r="'+ref+'" t="inlineStr"'+style+'><is><t xml:space="preserve">'+xmlEscape(value)+'</t></is></c>';
      }).join('');
      return '<row r="'+rowNumber+'">'+cells+'</row>';
    }).join('');
    const files={
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Hardware BOM" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:N'+tableRows.length+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="19"/><cols>'+cols+'</cols><sheetData>'+body+'</sheetData><pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>'
    };
    const encoder=new TextEncoder(),u16=(view,offset,value)=>view.setUint16(offset,value,true),u32=(view,offset,value)=>view.setUint32(offset,value>>>0,true),crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
    const localParts=[],centralParts=[];let offset=0;
    for(const [path,content] of Object.entries(files)){const name=encoder.encode(path),data=encoder.encode(content),crc=crc32(data),local=new Uint8Array(30+name.length+data.length),localView=new DataView(local.buffer);u32(localView,0,0x04034b50);u16(localView,4,20);u16(localView,6,0);u16(localView,8,0);u16(localView,10,0);u16(localView,12,33);u32(localView,14,crc);u32(localView,18,data.length);u32(localView,22,data.length);u16(localView,26,name.length);u16(localView,28,0);local.set(name,30);local.set(data,30+name.length);localParts.push(local);const central=new Uint8Array(46+name.length),centralView=new DataView(central.buffer);u32(centralView,0,0x02014b50);u16(centralView,4,20);u16(centralView,6,20);u16(centralView,8,0);u16(centralView,10,0);u16(centralView,12,0);u16(centralView,14,33);u32(centralView,16,crc);u32(centralView,20,data.length);u32(centralView,24,data.length);u16(centralView,28,name.length);u16(centralView,30,0);u16(centralView,32,0);u16(centralView,34,0);u16(centralView,36,0);u32(centralView,38,0);u32(centralView,42,offset);central.set(name,46);centralParts.push(central);offset+=local.length;}
    const centralSize=centralParts.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),endView=new DataView(end.buffer);u32(endView,0,0x06054b50);u16(endView,4,0);u16(endView,6,0);u16(endView,8,centralParts.length);u16(endView,10,centralParts.length);u32(endView,12,centralSize);u32(endView,16,offset);u16(endView,20,0);
    return new Blob([...localParts,...centralParts,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function tableSheet(name,columns,rows,widths,options={}){
    return {name,columns,rows:[columns,...rows],widths,formulaColumns:options.formulaColumns||{},formulaCells:options.formulaCells||{},numericColumns:options.numericColumns||[],format2Columns:options.format2Columns||[],merges:options.merges||[]};
  }
  function summarySheet(groups){
    const merges=[];let sheetRow=2;
    for(const group of groups){const first=sheetRow,last=sheetRow+group.rows.length-1;if(last>first)merges.push({col:9,start:first,end:last});sheetRow=last+2;}
    return tableSheet('Summary BOM Sheet',headers,allRows(groups),[20,24,28,40,20,36,40,20,30,30,18,18,20,20,14,18],{formulaColumns:{4:'D',7:'G'},numericColumns:[10,11,15],format2Columns:[15],merges});
  }
  function hardwareSheet(rows){
    return tableSheet('Hardware BOM',hardwareHeaders,rows,[20,24,40,24,16,14,12,12,24,38,18,14,24,24],{formulaColumns:{3:'C'},numericColumns:[6,7,10]});
  }
  function inhouseSheet(groups,data){
    const reserveCount=inhouseReserveCount(data);let sheetRow=2+reserveCount;const groupStarts=new Map();
    groups.forEach((group,index)=>{groupStarts.set(group.name,sheetRow);sheetRow+=group.rows.length+(index<groups.length-1?1:0);});
    const formulaCells={};sheetRow=2+reserveCount;
    groups.forEach((group,index)=>{
      group.rows.forEach((row,rowIndex)=>{const target=row.inhouseFormulaTarget,targetRow=target==='__MDF_BOM__'&&data?.mdfRows?.length?2:groupStarts.get(target);if(targetRow)formulaCells[sheetRow+rowIndex]={9:'C'+targetRow};});
      sheetRow+=group.rows.length+(index<groups.length-1?1:0);
    });
    return tableSheet('Inhouse BOM',inhouseHeaders,allInhouseRows(groups,data),[20,24,40,24,14,12,12,12,24,42,32,12,24,24],{formulaColumns:{3:'C'},formulaCells,numericColumns:[6,7,10]});
  }
  function childSheet(withRouting=false){
    const formulaCells={};if(withRouting)currentChildRows.forEach((entry,index)=>{if(entry?.formula)formulaCells[index+2]=entry.formula;});
    return tableSheet('Child BOM',childHeaders,currentChildRows.map(entry=>entry?.row||null),[24,40,14,12,12,24,44,32,14],{formulaCells,numericColumns:[3,4,7]});
  }
  function emptySheet(name){return {name,columns:[],rows:[],widths:[],formulaColumns:{},numericColumns:[],format2Columns:[],merges:[]};}
  function worksheetXml(sheet){
    const rows=sheet.rows||[],columnCount=sheet.columns.length||1,lastColumn=colName(columnCount-1),dimension=rows.length?'A1:'+lastColumn+rows.length:'A1';
    const cols=(sheet.widths||[]).map((width,index)=>'<col min="'+(index+1)+'" max="'+(index+1)+'" width="'+width+'" customWidth="1"/>').join('');
    const body=rows.map((row,index)=>{
      const rowNumber=index+1;if(!row)return '<row r="'+rowNumber+'"/>';
      const cells=row.map((value,col)=>{
        const ref=colName(col)+rowNumber,style=index===0?' s="1"':sheet.format2Columns.includes(col)?' s="2"':'';
        const directFormula=sheet.formulaCells[rowNumber]?.[col];
        if(index>0&&directFormula&&/^(?:[A-Z]+\d+|'[^']+'![A-Z]+\d+)$/.test(directFormula))return '<c r="'+ref+'" t="str"'+style+'><f>'+xmlEscape(directFormula)+'</f><v>'+xmlEscape(value)+'</v></c>';
        if(index>0&&sheet.formulaColumns[col])return '<c r="'+ref+'"'+style+'><f>LEN('+sheet.formulaColumns[col]+rowNumber+')</f><v>'+String(value??'').replace(/[^0-9]/g,'')+'</v></c>';
        if(index>0&&sheet.numericColumns.includes(col)&&value!==''&&Number.isFinite(Number(value)))return '<c r="'+ref+'"'+style+'><v>'+Number(value)+'</v></c>';
        if(sheet.merges.some(merge=>merge.col===col&&rowNumber>merge.start&&rowNumber<=merge.end))return '';
        return '<c r="'+ref+'" t="inlineStr"'+style+'><is><t xml:space="preserve">'+xmlEscape(value)+'</t></is></c>';
      }).join('');
      return '<row r="'+rowNumber+'">'+cells+'</row>';
    }).join('');
    const merges=sheet.merges.map(merge=>'<mergeCell ref="'+colName(merge.col)+merge.start+':'+colName(merge.col)+merge.end+'"/>').join('');
    const viewXml=rows.length?'<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>':'',colsXml=cols?'<cols>'+cols+'</cols>':'';
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="'+dimension+'"/>'+viewXml+(rows.length?'<sheetFormatPr defaultRowHeight="19"/>':'')+colsXml+'<sheetData>'+body+'</sheetData>'+(merges?'<mergeCells count="'+sheet.merges.length+'">'+merges+'</mergeCells>':'')+'<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>';
  }
  function createWorkbook(sheets){
    const sheetOverrides=sheets.map((sheet,index)=>'<Override PartName="/xl/worksheets/sheet'+(index+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('');
    const workbookSheets=sheets.map((sheet,index)=>'<sheet name="'+xmlEscape(sheet.name)+'" sheetId="'+(index+1)+'"'+(sheet.hidden?' state="hidden"':'')+' r:id="rId'+(index+1)+'"/>').join(''),activeTab=Math.max(0,sheets.findIndex(sheet=>!sheet.hidden));
    const sheetRelationships=sheets.map((sheet,index)=>'<Relationship Id="rId'+(index+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(index+1)+'.xml"/>').join('');
    const files={
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheetOverrides+'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="'+activeTab+'"/></bookViews><sheets>'+workbookSheets+'</sheets><calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>',
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheetRelationships+'<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.00"/></numFmts><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFF00"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'
    };
    sheets.forEach((sheet,index)=>files['xl/worksheets/sheet'+(index+1)+'.xml']=worksheetXml(sheet));
    const encoder=new TextEncoder(),u16=(view,offset,value)=>view.setUint16(offset,value,true),u32=(view,offset,value)=>view.setUint32(offset,value>>>0,true),crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
    const localParts=[],centralParts=[];let offset=0;
    for(const [path,content] of Object.entries(files)){const name=encoder.encode(path),data=encoder.encode(content),crc=crc32(data),local=new Uint8Array(30+name.length+data.length),localView=new DataView(local.buffer);u32(localView,0,0x04034b50);u16(localView,4,20);u16(localView,6,0);u16(localView,8,0);u16(localView,10,0);u16(localView,12,33);u32(localView,14,crc);u32(localView,18,data.length);u32(localView,22,data.length);u16(localView,26,name.length);u16(localView,28,0);local.set(name,30);local.set(data,30+name.length);localParts.push(local);const central=new Uint8Array(46+name.length),centralView=new DataView(central.buffer);u32(centralView,0,0x02014b50);u16(centralView,4,20);u16(centralView,6,20);u16(centralView,8,0);u16(centralView,10,0);u16(centralView,12,0);u16(centralView,14,33);u32(centralView,16,crc);u32(centralView,20,data.length);u32(centralView,24,data.length);u16(centralView,28,name.length);u16(centralView,30,0);u16(centralView,32,0);u16(centralView,34,0);u16(centralView,36,0);u32(centralView,38,0);u32(centralView,42,offset);central.set(name,46);centralParts.push(central);offset+=local.length;}
    const centralSize=centralParts.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),endView=new DataView(end.buffer);u32(endView,0,0x06054b50);u16(endView,4,0);u16(endView,6,0);u16(endView,8,centralParts.length);u16(endView,10,centralParts.length);u32(endView,12,centralSize);u32(endView,16,offset);u16(endView,20,0);
    return new Blob([...localParts,...centralParts,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function buildWorkbook(groups){return createWorkbook([summarySheet(groups)]);}
  function buildHardwareWorkbook(rows){return createWorkbook([hardwareSheet(rows)]);}
  function buildInhouseWorkbook(){return createWorkbook([inhouseSheet(currentInhouseGroups,currentData)]);}
  function buildChildWorkbook(){
    const supportingSheets=[summarySheet(currentGroups),hardwareSheet(currentHardwareRows),inhouseSheet(currentInhouseGroups,currentData)];
    supportingSheets.forEach(sheet=>sheet.hidden=true);
    return createWorkbook([...supportingSheets,childSheet(true)]);
  }
  function buildAllBomsWorkbook(){return createWorkbook([summarySheet(currentGroups),hardwareSheet(currentHardwareRows),inhouseSheet(currentInhouseGroups,currentData),childSheet(true)]);}
  function saveWorkbook(blob,filename){
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=filename;anchor.style.display='none';document.body.appendChild(anchor);anchor.click();anchor.remove();
    const status=$('status');status.classList.remove('error');status.textContent='Excel download started.';
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  function reportDownloadError(error){const status=$('status');status.classList.add('error');status.textContent=`Could not create the Excel download: ${error?.message||'Please try again.'}`;}
  function downloadAllBoms(event){if(!event?.isTrusted||event.currentTarget!==$('downloadAll')||!currentData)return;try{saveWorkbook(buildAllBomsWorkbook(),currentModel.replace(/[\\/:*?"<>|]/g,'_')+' - BOM.xlsx');}catch(error){reportDownloadError(error);}}
  function downloadHardware(event){if(!event?.isTrusted||event.currentTarget!==$('hardwareDownload')||!currentHardwareRows.length)return;try{saveWorkbook(buildHardwareWorkbook(currentHardwareRows),currentModel.replace(/[\\/:*?"<>|]/g,'_')+' - Hardware BOM.xlsx');}catch(error){reportDownloadError(error);}}
  function downloadInhouse(event){if(!event?.isTrusted||event.currentTarget!==$('inhouseDownload')||!currentInhouseGroups.length)return;try{saveWorkbook(buildInhouseWorkbook(),currentModel.replace(/[\\/:*?"<>|]/g,'_')+' - Inhouse BOM.xlsx');}catch(error){reportDownloadError(error);}}
  function downloadChild(event){if(!event?.isTrusted||event.currentTarget!==$('childDownload')||!currentChildRows.some(Boolean))return;try{saveWorkbook(buildChildWorkbook(),currentModel.replace(/[\\/:*?"<>|]/g,'_')+' - Child BOM.xlsx');}catch(error){reportDownloadError(error);}}
  function download(event){if(!event?.isTrusted||event.currentTarget!==$('download')||!currentGroups.length)return;try{saveWorkbook(buildWorkbook(currentGroups),`Summary BOM Sheet - ${currentModel.replace(/[\\/:*?"<>|]/g,'_')}.xlsx`);}catch(error){reportDownloadError(error);}}
  function activateSectionTab(tab){
    const tabs=[...document.querySelectorAll('[role="tab"]')];
    for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;}
    for(const panel of document.querySelectorAll('[role="tabpanel"]'))panel.hidden=panel.id!==tab.getAttribute('aria-controls');
  }
  async function processFiles(files,mdfFiles=[]){
    const selected=[...files].filter(Boolean),selectedMdf=[...mdfFiles].filter(Boolean);if(!selected.length)return;
    const workbookCount=selected.length+selectedMdf.length,status=$('status');$('result').classList.remove('visible');status.classList.remove('error');status.textContent=`Reading ${workbookCount} Excel workbook${workbookCount===1?'':'s'}…`;
    try{const [workbooks,mdfWorkbooks]=await Promise.all([Promise.all(selected.map(async file=>readWorkbook(await file.arrayBuffer()))),Promise.all(selectedMdf.map(async file=>readWorkbook(await file.arrayBuffer())))]),data=extractData(workbooks.flat());data.mdfRows=mdfWorkbooks.length?extractMdfRows(mdfWorkbooks.flat()):[];data.inhouseHasMdf=true;currentModel=data.model;currentData=data;removedTileNames.clear();currentGroups=makeGroups(data);render(data,currentGroups);renderHardware(data);renderInhouse(data,activeTileVariants());renderChild(data);status.textContent='';}
    catch(error){currentGroups=[];status.classList.add('error');status.textContent=error?.message||'Unable to process this workbook.';}
  }
  async function initialize(){
    await loadTileVariants();
    $('bomFile').addEventListener('change',event=>processFiles(event.target.files,$('mdfFile').files));$('mdfFile').addEventListener('change',event=>processFiles($('bomFile').files,event.target.files));$('download').addEventListener('click',download);$('hardwareDownload').addEventListener('click',downloadHardware);$('inhouseDownload').addEventListener('click',downloadInhouse);$('childDownload').addEventListener('click',downloadChild);$('downloadAll').addEventListener('click',downloadAllBoms);
    const tablist=document.querySelector('[role="tablist"]'),tabs=[...tablist.querySelectorAll('[role="tab"]')];tabs.forEach(tab=>tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1);
    tablist.addEventListener('click',event=>{const tab=event.target.closest('[role="tab"]');if(tab)activateSectionTab(tab);});
    tablist.addEventListener('keydown',event=>{const active=tabs.indexOf(document.activeElement);if(active<0)return;let next;if(event.key==='ArrowRight')next=(active+1)%tabs.length;else if(event.key==='ArrowLeft')next=(active-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();activateSectionTab(tabs[next]);});
    $('tileVariants').addEventListener('click',event=>{const button=event.target.closest('[data-remove-tile]');if(!button||!currentData)return;const [removed]=currentGroups.splice(Number(button.dataset.removeTile),1);if(removed)removedTileNames.add(removed.name);render(currentData,currentGroups);renderInhouse(currentData,activeTileVariants());renderChild(currentData);});
    window.setInterval(async()=>{const changed=await loadTileVariants();if(changed&&currentData){currentGroups=makeGroups(currentData).filter(group=>!removedTileNames.has(group.name));render(currentData,currentGroups);renderInhouse(currentData,activeTileVariants());renderChild(currentData);}},1500);
  }
  initialize();
})();

