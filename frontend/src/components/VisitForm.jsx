import React from 'react';
import FieldCard from './FieldCard';
import { useTranslation } from '../hooks/useTranslation';

export default function VisitForm({ fields = {}, previousFields = {}, confidences = {}, highlightedFields = [], onEditField }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FieldCard
        label={t('name')}
        value={fields.beneficiary_name}
        previousValue={previousFields.beneficiary_name}
        confidence={confidences.beneficiary_name}
        isHighlighted={highlightedFields.includes('beneficiary_name')}
        onEdit={() => onEditField('beneficiary_name', fields.beneficiary_name)}
      />

      <FieldCard
        label={t('beneficiary_id')}
        value={fields.beneficiary_id}
        previousValue={previousFields.beneficiary_id}
        confidence={confidences.beneficiary_id}
        isHighlighted={highlightedFields.includes('beneficiary_id')}
        onEdit={() => onEditField('beneficiary_id', fields.beneficiary_id)}
      />

      <FieldCard
        label={t('visit_type')}
        value={fields.visit_type}
        previousValue={previousFields.visit_type}
        confidence={confidences.visit_type}
        isHighlighted={highlightedFields.includes('visit_type')}
        onEdit={() => onEditField('visit_type', fields.visit_type)}
      />

      <FieldCard
        label={t('weight')}
        value={fields.weight_kg}
        previousValue={previousFields.weight_kg}
        unit="kg"
        confidence={confidences.weight_kg}
        isHighlighted={highlightedFields.includes('weight_kg')}
        onEdit={() => onEditField('weight_kg', fields.weight_kg)}
      />

      <FieldCard
        label={t('next_visit')}
        value={fields.next_visit_date}
        previousValue={previousFields.next_visit_date}
        confidence={confidences.next_visit_date}
        isHighlighted={highlightedFields.includes('next_visit_date')}
        onEdit={() => onEditField('next_visit_date', fields.next_visit_date)}
      />

      <FieldCard
        label={t('bp')}
        value={fields.bp_systolic && fields.bp_diastolic ? `${fields.bp_systolic}/${fields.bp_diastolic}` : null}
        previousValue={previousFields.bp_systolic && previousFields.bp_diastolic ? `${previousFields.bp_systolic}/${previousFields.bp_diastolic}` : null}
        confidence={confidences.bp_systolic || 0.9}
        isHighlighted={highlightedFields.includes('bp')}
        onEdit={() => onEditField('bp_systolic', fields.bp_systolic)}
      />

      <FieldCard
        label={t('hemoglobin')}
        value={fields.hemoglobin}
        previousValue={previousFields.hemoglobin}
        unit="g/dL"
        confidence={confidences.hemoglobin || 0.9}
        isHighlighted={highlightedFields.includes('hemoglobin')}
        onEdit={() => onEditField('hemoglobin', fields.hemoglobin)}
      />

      <FieldCard
        label={t('vaccinations_given')}
        value={Array.isArray(fields.vaccinations_given) ? fields.vaccinations_given.join(', ') : fields.vaccinations_given}
        previousValue={Array.isArray(previousFields.vaccinations_given) ? previousFields.vaccinations_given.join(', ') : previousFields.vaccinations_given}
        confidence={confidences.vaccinations_given || 0.9}
        isHighlighted={highlightedFields.includes('vaccinations_given')}
        onEdit={() => onEditField('vaccinations_given', fields.vaccinations_given)}
      />
    </div>
  );
}
