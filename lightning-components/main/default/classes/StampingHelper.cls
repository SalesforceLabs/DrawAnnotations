/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class StampingHelper
{
    private List<DA_Stamps__mdt> additionalStamps = null;
    private Boolean allowExtraStamps = false;

	@TestVisible
	private void addStamps(String devName, String label, String svgStamp)
    {
        DA_Stamps__mdt s = new DA_Stamps__mdt();
        s.DeveloperName = devName;
        s.MasterLabel = label;
        s.Stamp_SVG_String__c = svgStamp;
        
        if (additionalStamps == null)
        {
            additionalStamps = new List<DA_Stamps__mdt>();
        }
        additionalStamps.add(s);
        allowExtraStamps = true;
    }
    
    @TestVisible
    private List<DA_Stamps__mdt> getTestStamps()
    {
        List<DA_Stamps__mdt> stamps = getStamps();
        if (stamps != null && allowExtraStamps)
        {
            for (DA_Stamps__mdt s : additionalStamps)
            {
                stamps.add(s);
            }
        }
		return stamps;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<DA_Stamps__mdt> getStamps(){
        List<DA_Stamps__mdt> stamps = [SELECT DeveloperName, MasterLabel, Stamp_SVG_String__c
                                       FROM DA_Stamps__mdt
                                       ORDER BY MasterLabel];
                
        return stamps;
    }
}