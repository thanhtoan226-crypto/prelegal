"use client";

import { NDAFormData, PartyInfo } from "@/lib/types";

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string;
  party: PartyInfo;
  onChange: (p: PartyInfo) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-gray-700">{label}</legend>
      <input
        className="input-field"
        placeholder="Print Name"
        value={party.printName}
        onChange={(e) => onChange({ ...party, printName: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Title"
        value={party.title}
        onChange={(e) => onChange({ ...party, title: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Company"
        value={party.company}
        onChange={(e) => onChange({ ...party, company: e.target.value })}
      />
      <input
        className="input-field"
        placeholder="Notice Address (email or postal)"
        value={party.noticeAddress}
        onChange={(e) => onChange({ ...party, noticeAddress: e.target.value })}
      />
      <input
        className="input-field"
        type="date"
        value={party.date}
        onChange={(e) => onChange({ ...party, date: e.target.value })}
      />
    </fieldset>
  );
}

export default function NDAForm({ data, onChange }: Props) {
  const update = (partial: Partial<NDAFormData>) => onChange({ ...data, ...partial });

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="label">Purpose</label>
        <textarea
          className="input-field min-h-[60px]"
          value={data.purpose}
          onChange={(e) => update({ purpose: e.target.value })}
        />
      </div>

      <div>
        <label className="label">Effective Date</label>
        <input
          className="input-field"
          type="date"
          value={data.effectiveDate}
          onChange={(e) => update({ effectiveDate: e.target.value })}
        />
      </div>

      <div>
        <label className="label">MNDA Term</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mndaTermType"
              checked={data.mndaTermType === "expires"}
              onChange={() => update({ mndaTermType: "expires" })}
            />
            <span>Expires</span>
            <input
              className="input-field w-16 text-center"
              type="number"
              min="1"
              value={data.mndaTermYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                update({ mndaTermYears: isNaN(v) || v < 1 ? "1" : String(v) });
              }}
            />
            <span>year(s) from Effective Date</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mndaTermType"
              checked={data.mndaTermType === "continues"}
              onChange={() => update({ mndaTermType: "continues" })}
            />
            <span>Continues until terminated</span>
          </label>
        </div>
      </div>

      <div>
        <label className="label">Term of Confidentiality</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="confTermType"
              checked={data.confidentialityTermType === "expires"}
              onChange={() => update({ confidentialityTermType: "expires" })}
            />
            <input
              className="input-field w-16 text-center"
              type="number"
              min="1"
              value={data.confidentialityTermYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                update({ confidentialityTermYears: isNaN(v) || v < 1 ? "1" : String(v) });
              }}
            />
            <span>year(s) from Effective Date</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="confTermType"
              checked={data.confidentialityTermType === "perpetuity"}
              onChange={() => update({ confidentialityTermType: "perpetuity" })}
            />
            <span>In perpetuity</span>
          </label>
        </div>
      </div>

      <div>
        <label className="label">Governing Law (State)</label>
        <input
          className="input-field"
          placeholder="e.g. Delaware"
          value={data.governingLaw}
          onChange={(e) => update({ governingLaw: e.target.value })}
        />
      </div>

      <div>
        <label className="label">Jurisdiction</label>
        <input
          className="input-field"
          placeholder='e.g. "courts located in New Castle, DE"'
          value={data.jurisdiction}
          onChange={(e) => update({ jurisdiction: e.target.value })}
        />
      </div>

      <div>
        <label className="label">MNDA Modifications (optional)</label>
        <textarea
          className="input-field min-h-[60px]"
          placeholder="List any modifications to the MNDA"
          value={data.modifications}
          onChange={(e) => update({ modifications: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PartyFields
          label="Party 1"
          party={data.party1}
          onChange={(p) => update({ party1: p })}
        />
        <PartyFields
          label="Party 2"
          party={data.party2}
          onChange={(p) => update({ party2: p })}
        />
      </div>
    </form>
  );
}
