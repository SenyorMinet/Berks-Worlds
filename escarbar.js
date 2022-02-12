function autoEscarbar()
{
	var picoSerial = equiparPico();	
	var caveCoords = findCaves(30);
	while (caveCoords.length > 0)
	{
		Orion.CancelWaitGump();

     		var closest = GetClosest(caveCoords);
     		var caveCoord = caveCoords[closest];        
     		caveCoords = Remove(caveCoords, closest);
     		Orion.Wait(500);
     		Orion.WalkTo(caveCoord.x, caveCoord.y, 0);
    		var timeout = Orion.Now() + 6000; //tiempo de minado?
        
       	while (!InRange(caveCoord.x, caveCoord.y) && Orion.Now() < timeout) {
        Orion.Print('.');
     	      	Orion.Wait(500);
       	} 
       	if (InRange(caveCoord.x, caveCoord.y)) {
       	    	minarTile(caveCoord.x, caveCoord.y, picoSerial);
       	}
            Orion.Print(['AA'], 'Tile Minado');
            Orion.Wait(200);
   	}
}



// funciones de ayuda para autoEscarbar
function Remove(arr, idx)
{
	var result = [];
	for (var i = 0; i < arr.length; ++i) {
        	if (i != idx) {
	        	result.push(arr[i]);
	  	}
	}
	return result;
}

function findCaves(range)
{
    var d = range; 
    var caveCoords = []; 
    var found = 0;
    
    for (x = Player.X() - d; x < Player.X() + d; ++x)
    {
        for (y = Player.Y() - d; y < Player.Y() + d; ++y)
        {
            if (Orion.ValidateTargetTile('mine', x, y))  
            {

                var coord = { x: x, y: y};            
                caveCoords.push(coord); 
                found++;                
            }
        }
    
    }

    return caveCoords;
}

function GetClosest(caveCoords)
{
    var px = Player.X();
    var py = Player.Y();
    
    var closest = 1;
    var dsq = 1000;
    
    for (var i =0; i < caveCoords.length; ++i)
    {
        var dx = Math.abs(px - caveCoords[i].x);
        var dy = Math.abs(py - caveCoords[i].y);
        var dq = dx + dy;
        if (dq < dsq)
        {
            dsq = dq;
            closest = i;
        }
    }
    
    return closest;
}

function InRange(x, y)
{
    var dx = Math.abs(Player.X() - x);
    var dy = Math.abs(Player.Y() - y);
    return dx < 2 && dy < 2;    
}

function minarTile(x, y, picoSerial)
{
    var exitoMinar = ' en tu mochila.';
    var cansado = 'Estas demasiado cansado para volver a minar';
    var noMineral = 'No hay nada por lo que minar aqui.';
    var otroSitio = 'Prueba a minar en cualquier otro sitio.';
    var noPuedes = 'No puedes picar aqui.';
    var golpeas = 'Golpeas sin parar y solo sacas tierra. no encuentras minerales.';
	var muyLejos = 'Intentas golpear demasiado lejos.';
    var timeout = Orion.Now() + 6000;
            
    while (true)
    {
        Orion.ClearJournal(exitoMinar);
        Orion.ClearJournal(cansado);
        Orion.ClearJournal(noMineral);
        Orion.ClearJournal(otroSitio);
        Orion.ClearJournal(noPuedes);
		Orion.ClearJournal(muyLejos);
        Orion.ClearJournal(golpeas)
        Orion.UseObject(picoSerial);
        Orion.WaitTargetTile('mine', x, y, 0);        
     
        var timeout = Orion.Now() + 6000;
            
        while (!(Orion.InJournal(exitoMinar) 
            || Orion.InJournal(otroSitio)
            || Orion.InJournal(noMineral) 
            || Orion.InJournal(noPuedes)
            || Orion.InJournal(golpeas)
            || Orion.Now() > timeout)) 
        {
         Orion.Wait(1000);
            if (Orion.InJournal(cansado))
            {
                Orion.Wait(1000);
            }
            if (Orion.InJournal(exitoMinar)) 
            {
                Orion.Wait(1000);
                Orion.Print(['BB'], 'Guardando minerales')
                guardarMineralenCarreta();
            }
        }      
        if (Orion.InJournal(noMineral) || Orion.InJournal(noPuedes) || Orion.InJournal(otroSitio) || Orion.InJournal(muyLejos))
            return;
    }            
}
function equiparPico()
{
    Orion.Unequip(1);
	Orion.Unequip(2);
	Orion.Wait(1000);
	//tipos depico
	var herramientaPico = [
    	['0x0F39'], //PALA
    	['0x0E85'], //hacha larga de batalla
        ['0x0E85'], //Pico de minero
    	['0x0E86'], //Pico de Minero
    	['0x0F45'], // hacha de ejecucion

    	];
    	
    	var countRows = herramientaPico.length;
    	for (i = 0; i < countRows; i++)
    	{
    		var bolsaPico = Orion.FindType(herramientaPico[i], '0x0000|0x084D', 'backpack');
    		if (bolsaPico.length != 0)
    		{
    			var pico = bolsaPico;
			Orion.Equip(pico);
			Orion.Wait(500);
			return pico;
    		} else {
    			var pico = "";
    		}
    	}	
	if (pico.length == 0)
	{
        Orion.Print(['CC'],'Falta un pico');
		return '';
	}
}
//Guardar MInerales en carreta
function guardarMineralenCarreta()
{
                Orion.UseObject('0x400A5DCD');//Usar Carreta de Minerales
                if (Orion.WaitForGump(1000))
                {
                    var gump0 = Orion.GetGump('last');
                    if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x0000052E'))//Menu de la carreta (serial)
                  
                    {
                        gump0.Select(Orion.CreateGumpHook(50));// Boton Guardar Mineral
                        Orion.Wait(1000);
                    }
                }
                if (Orion.WaitForTarget(1000))
                    Orion.TargetType('0x19B9 || 0x19B8 || 0x19BA || 0x19B7');//graphic del mineral 
                    Orion.Wait(500);
        }
